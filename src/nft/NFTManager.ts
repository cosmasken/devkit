/**
 * NFT contract operations and management
 */

import Web3 from 'web3';
import { NFT, SDKConfig, TransactionOptions } from '../core/types';
import { WalletManager } from '../wallet/WalletManager';
import { GasManager } from '../utils/GasManager';
import { ContractError, GasEstimationError } from '../core/errors';

export class NFTManager {
    private web3: Web3;
    private walletManager: WalletManager;
    private gasManager: GasManager;
    private config: SDKConfig;
    private nfts: Map<string, NFT>;

    constructor(web3: Web3, walletManager: WalletManager, gasManager: GasManager, config: SDKConfig) {
        this.web3 = web3;
        this.walletManager = walletManager;
        this.gasManager = gasManager;
        this.config = config;
        this.nfts = new Map();
    }

    /**
     * Deploys a new GameNFT contract to the blockchain
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the deployed contract address
     */
    async deployNFTContract(options?: TransactionOptions): Promise<string> {
        this.walletManager.ensureWalletConnected();

        try {
            // Import contract artifacts
            const { GAME_NFT_ABI, GAME_NFT_BYTECODE } = await import('../contracts');

            // Create contract instance for deployment
            const contract = new this.web3.eth.Contract(GAME_NFT_ABI as any);

            // Prepare deployment data
            const deployData = contract.deploy({
                data: GAME_NFT_BYTECODE,
                arguments: [] // GameNFT constructor takes no parameters
            }).encodeABI();

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!,
                data: deployData
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Deploy the contract
            const deployedContract = await contract.deploy({
                data: GAME_NFT_BYTECODE,
                arguments: []
            }).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            const contractAddress = deployedContract.options.address;

            if (!contractAddress) {
                throw new ContractError('NFT contract deployment failed - no address returned');
            }

            // Store contract address in configuration for future use
            if (!this.config.contractAddresses) {
                this.config.contractAddresses = {};
            }
            this.config.contractAddresses.nftContract = contractAddress;

            console.log(`GameNFT contract deployed successfully at: ${contractAddress}`);
            return contractAddress;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for NFT contract deployment: ${error.message}`);
            }

            throw new ContractError(`Failed to deploy GameNFT contract: ${error.message}`);
        }
    }

    /**
     * Mints a new NFT by calling the GameNFT contract's mintNFT() function
     * @param recipient - The address to receive the minted NFT
     * @param name - The name of the NFT
     * @param description - The description of the NFT
     * @param image - The image URL or IPFS hash for the NFT
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the minted token ID
     */
    async mintNFT(
        recipient: string,
        name: string,
        description: string,
        image: string,
        options?: TransactionOptions
    ): Promise<number> {
        this.walletManager.ensureWalletConnected();

        // Get NFT contract address from configuration
        const nftContractAddress = this.config.contractAddresses?.nftContract;
        if (!nftContractAddress) {
            throw new ContractError('NFT contract address not configured. Deploy NFT contract first.');
        }

        try {
            // Import contract ABI
            const { GAME_NFT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_NFT_ABI as any, nftContractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the mintNFT transaction
            const receipt = await contract.methods.mintNFT(recipient, name, description, image).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            // Extract token ID from the Transfer event in the receipt
            let tokenId: number = 0;
            if (receipt.events && receipt.events.Transfer) {
                const transferEvent = Array.isArray(receipt.events.Transfer)
                    ? receipt.events.Transfer[0]
                    : receipt.events.Transfer;
                tokenId = parseInt(transferEvent.returnValues.tokenId);
            }

            // Create NFT object and store it locally
            const nft: NFT = {
                id: `nft_${tokenId}`,
                playerId: recipient,
                metadata: { name, description, image },
                contractAddress: nftContractAddress,
                tokenId: tokenId.toString()
            };

            this.nfts.set(nft.id, nft);

            console.log(`NFT minted successfully. Token ID: ${tokenId}. Transaction: ${receipt.transactionHash}`);
            return tokenId;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for NFT minting: ${error.message}`);
            }

            throw new ContractError(`Failed to mint NFT: ${error.message}`);
        }
    }

    /**
     * Gets NFT metadata from the contract
     * @param tokenId - The token ID to query metadata for
     * @param contractAddress - Optional contract address (uses configured address if not provided)
     * @returns Promise resolving to the NFT metadata
     */
    async getNFTMetadata(tokenId: number, contractAddress?: string): Promise<{ name: string; description: string; image: string }> {
        // Use provided contract address or get from configuration
        const nftContractAddress = contractAddress || this.config.contractAddresses?.nftContract;
        if (!nftContractAddress) {
            throw new ContractError('NFT contract address not provided and not configured');
        }

        try {
            // Import contract ABI
            const { GAME_NFT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_NFT_ABI as any, nftContractAddress);

            // Query the token metadata from the contract
            const metadata = await contract.methods.getTokenMetadata(tokenId).call();

            return {
                name: metadata.name,
                description: metadata.description,
                image: metadata.image
            };

        } catch (error: any) {
            throw new ContractError(`Failed to get NFT metadata for token ${tokenId}: ${error.message}`);
        }
    }

    /**
     * Gets the owner of an NFT token
     * @param tokenId - The token ID to check ownership for
     * @param contractAddress - Optional contract address (uses configured address if not provided)
     * @returns Promise resolving to the owner's address
     */
    async getNFTOwner(tokenId: number, contractAddress?: string): Promise<string> {
        // Use provided contract address or get from configuration
        const nftContractAddress = contractAddress || this.config.contractAddresses?.nftContract;
        if (!nftContractAddress) {
            throw new ContractError('NFT contract address not provided and not configured');
        }

        try {
            // Import contract ABI
            const { GAME_NFT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_NFT_ABI as any, nftContractAddress);

            // Query the token owner from the contract
            const owner = await contract.methods.ownerOf(tokenId).call();

            return owner;

        } catch (error: any) {
            throw new ContractError(`Failed to get NFT owner for token ${tokenId}: ${error.message}`);
        }
    }

    /**
     * Transfers an NFT from one address to another
     * @param from - The current owner's address
     * @param to - The recipient's address
     * @param tokenId - The token ID to transfer
     * @param contractAddress - Optional contract address (uses configured address if not provided)
     * @param options - Transaction options including gas settings
     * @returns Promise resolving to the transaction receipt
     */
    async transferNFT(
        from: string,
        to: string,
        tokenId: number,
        contractAddress?: string,
        options?: TransactionOptions
    ): Promise<any> {
        this.walletManager.ensureWalletConnected();

        // Use provided contract address or get from configuration
        const nftContractAddress = contractAddress || this.config.contractAddresses?.nftContract;
        if (!nftContractAddress) {
            throw new ContractError('NFT contract address not provided and not configured');
        }

        try {
            // Import contract ABI
            const { GAME_NFT_ABI } = await import('../contracts');

            // Create contract instance
            const contract = new this.web3.eth.Contract(GAME_NFT_ABI as any, nftContractAddress);

            const transactionObject = {
                from: this.walletManager.getWalletAddress()!
            };

            // Prepare gas settings
            const gasSettings = await this.gasManager.prepareGasSettings(transactionObject, options);

            // Execute the transferNFT transaction
            const receipt = await contract.methods.transferNFT(from, to, tokenId).send({
                from: this.walletManager.getWalletAddress()!,
                gas: gasSettings.gas,
                gasPrice: gasSettings.gasPrice,
                value: options?.value || '0',
                nonce: options?.nonce
            });

            // Update local NFT cache if we have this NFT stored
            const nftId = `nft_${tokenId}`;
            const nft = this.nfts.get(nftId);
            if (nft) {
                nft.playerId = to;
                this.nfts.set(nftId, nft);
            }

            console.log(`NFT ${tokenId} transferred from ${from} to ${to}. Transaction: ${receipt.transactionHash}`);
            return receipt;

        } catch (error: any) {
            if (error.name === 'ContractError') {
                throw error;
            }

            // Handle gas estimation errors
            if (error.message?.includes('gas') || error.message?.includes('Gas')) {
                throw new GasEstimationError(`Gas estimation failed for NFT transfer: ${error.message}`);
            }

            throw new ContractError(`Failed to transfer NFT ${tokenId}: ${error.message}`);
        }
    }

    /**
     * Gets an NFT by ID from local cache
     */
    getNFT(nftId: string): NFT | undefined {
        return this.nfts.get(nftId);
    }

    /**
     * Claims an NFT for a player (async)
     */
    async claimNFT(playerId: string, nftId: string, options?: TransactionOptions): Promise<NFT | undefined> {
        const nft = this.nfts.get(nftId);
        if (!nft) return undefined;
        
        // Update the NFT owner
        nft.playerId = playerId;
        this.nfts.set(nftId, nft);
        return nft;
    }

    /**
     * Claims an NFT for a player (sync - for legacy compatibility)
     */
    claimNFTSync(playerId: string, nftId: string): NFT | undefined {
        const nft = this.nfts.get(nftId);
        if (!nft) return undefined;
        
        // Update the NFT owner
        nft.playerId = playerId;
        this.nfts.set(nftId, nft);
        return nft;
    }

    /**
     * Gets all NFTs owned by a player
     */
    getPlayerNFTs(playerId: string): NFT[] {
        return Array.from(this.nfts.values()).filter(nft => nft.playerId === playerId);
    }

    /**
     * Lists all NFTs
     */
    listNFTs(): NFT[] {
        return Array.from(this.nfts.values());
    }

    /**
     * Adds an NFT directly to the manager (for legacy compatibility)
     */
    addNFT(nft: NFT): void {
        this.nfts.set(nft.id, nft);
    }

    /**
     * Updates the NFT contract address in configuration
     */
    setNFTContractAddress(address: string): void {
        if (!this.config.contractAddresses) {
            this.config.contractAddresses = {};
        }
        this.config.contractAddresses.nftContract = address;
    }
}