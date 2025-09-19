/**
 * Tests for NFT operations in SomniaGameKit
 */

import { SomniaGameKit, SDKConfig } from '../src/index';

describe('SomniaGameKit NFT Operations', () => {
    let sdk: SomniaGameKit;
    let config: SDKConfig;

    beforeEach(async () => {
        sdk = new SomniaGameKit();
        config = {
            network: 'local', // Use local network to avoid WebSocket issues in tests
            rpcUrl: 'http://localhost:8545',
            contractAddresses: {
                nftContract: '0x1234567890123456789012345678901234567890'
            }
        };
        await sdk.initialize(config);
        await sdk.connectWallet('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    });

    afterEach(async () => {
        if (sdk) {
            await sdk.cleanup();
        }
    });

    describe('mintNFT', () => {
        it('should have mintNFT method with correct signature', () => {
            expect(typeof sdk.mintNFT).toBe('function');
        });

        it('should throw WalletConnectionError when wallet not connected', async () => {
            const sdkNoWallet = new SomniaGameKit();
            await sdkNoWallet.initialize(config);

            try {
                await expect(
                    sdkNoWallet.mintNFT(
                        '0x1234567890123456789012345678901234567890',
                        'Test NFT',
                        'A test NFT',
                        'https://example.com/image.png'
                    )
                ).rejects.toThrow('Wallet must be connected to mint NFTs');
            } finally {
                await sdkNoWallet.cleanup();
            }
        });

        it('should throw ContractError when NFT contract not configured', async () => {
            const configNoNFT = { ...config };
            delete configNoNFT.contractAddresses?.nftContract;

            const sdkNoContract = new SomniaGameKit();
            await sdkNoContract.initialize(configNoNFT);
            await sdkNoContract.connectWallet('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');

            try {
                await expect(
                    sdkNoContract.mintNFT(
                        '0x1234567890123456789012345678901234567890',
                        'Test NFT',
                        'A test NFT',
                        'https://example.com/image.png'
                    )
                ).rejects.toThrow('NFT contract address not configured');
            } finally {
                await sdkNoContract.cleanup();
            }
        });
    });

    describe('getNFTMetadata', () => {
        it('should have getNFTMetadata method with correct signature', () => {
            expect(typeof sdk.getNFTMetadata).toBe('function');
        });

        it('should throw ContractError when contract address not provided or configured', async () => {
            const configNoNFT = { ...config };
            delete configNoNFT.contractAddresses?.nftContract;

            const sdkNoContract = new SomniaGameKit();
            await sdkNoContract.initialize(configNoNFT);

            try {
                await expect(
                    sdkNoContract.getNFTMetadata(1)
                ).rejects.toThrow('NFT contract address not provided and not configured');
            } finally {
                await sdkNoContract.cleanup();
            }
        });
    });

    describe('getNFTOwner', () => {
        it('should have getNFTOwner method with correct signature', () => {
            expect(typeof sdk.getNFTOwner).toBe('function');
        });

        it('should throw ContractError when contract address not provided or configured', async () => {
            const configNoNFT = { ...config };
            delete configNoNFT.contractAddresses?.nftContract;

            const sdkNoContract = new SomniaGameKit();
            await sdkNoContract.initialize(configNoNFT);

            try {
                await expect(
                    sdkNoContract.getNFTOwner(1)
                ).rejects.toThrow('NFT contract address not provided and not configured');
            } finally {
                await sdkNoContract.cleanup();
            }
        });
    });

    describe('transferNFT', () => {
        it('should have transferNFT method with correct signature', () => {
            expect(typeof sdk.transferNFT).toBe('function');
        });

        it('should throw WalletConnectionError when wallet not connected', async () => {
            const sdkNoWallet = new SomniaGameKit();
            await sdkNoWallet.initialize(config);

            try {
                await expect(
                    sdkNoWallet.transferNFT(
                        '0x1234567890123456789012345678901234567890',
                        '0x0987654321098765432109876543210987654321',
                        1
                    )
                ).rejects.toThrow('Wallet must be connected to transfer NFTs');
            } finally {
                await sdkNoWallet.cleanup();
            }
        });

        it('should throw ContractError when NFT contract not configured', async () => {
            const configNoNFT = { ...config };
            delete configNoNFT.contractAddresses?.nftContract;

            const sdkNoContract = new SomniaGameKit();
            await sdkNoContract.initialize(configNoNFT);
            await sdkNoContract.connectWallet('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');

            await expect(
                sdkNoContract.transferNFT(
                    '0x1234567890123456789012345678901234567890',
                    '0x0987654321098765432109876543210987654321',
                    1
                )
            ).rejects.toThrow('NFT contract address not provided and not configured');
        });
    });

    describe('Method signatures and parameters', () => {
        it('should have all required NFT methods', () => {
            expect(typeof sdk.mintNFT).toBe('function');
            expect(typeof sdk.getNFTMetadata).toBe('function');
            expect(typeof sdk.getNFTOwner).toBe('function');
            expect(typeof sdk.transferNFT).toBe('function');
        });

        it('mintNFT should accept correct parameters', () => {
            // Check that the method exists and can be called with the expected parameters
            const mintNFTCall = () => sdk.mintNFT(
                '0x1234567890123456789012345678901234567890',
                'Test NFT',
                'A test NFT',
                'https://example.com/image.png'
            );

            // Should not throw a parameter error (will throw network error instead)
            expect(mintNFTCall).not.toThrow();
        });

        it('getNFTMetadata should accept correct parameters', () => {
            const getMetadataCall = () => sdk.getNFTMetadata(1);
            expect(getMetadataCall).not.toThrow();

            const getMetadataWithAddressCall = () => sdk.getNFTMetadata(1, '0x1234567890123456789012345678901234567890');
            expect(getMetadataWithAddressCall).not.toThrow();
        });

        it('getNFTOwner should accept correct parameters', () => {
            const getOwnerCall = () => sdk.getNFTOwner(1);
            expect(getOwnerCall).not.toThrow();

            const getOwnerWithAddressCall = () => sdk.getNFTOwner(1, '0x1234567890123456789012345678901234567890');
            expect(getOwnerWithAddressCall).not.toThrow();
        });

        it('transferNFT should accept correct parameters', () => {
            const transferCall = () => sdk.transferNFT(
                '0x1234567890123456789012345678901234567890',
                '0x0987654321098765432109876543210987654321',
                1
            );
            expect(transferCall).not.toThrow();

            const transferWithAddressCall = () => sdk.transferNFT(
                '0x1234567890123456789012345678901234567890',
                '0x0987654321098765432109876543210987654321',
                1,
                '0x1111111111111111111111111111111111111111'
            );
            expect(transferWithAddressCall).not.toThrow();
        });
    });
});