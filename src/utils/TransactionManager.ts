/**
 * Transaction management and confirmation utilities
 */

import Web3 from 'web3';
import { BlockchainError } from '../core/errors';

export class TransactionManager {
    private web3: Web3;

    constructor(web3: Web3) {
        this.web3 = web3;
    }

    /**
     * Waits for a transaction to be confirmed
     * @param transactionHash - The transaction hash to wait for
     * @param confirmations - Number of confirmations to wait for (default: 1)
     * @param timeout - Timeout in milliseconds (default: 60000)
     * @returns Promise resolving to the transaction receipt
     */
    async waitForTransactionConfirmation(
        transactionHash: string,
        confirmations: number = 1,
        timeout: number = 60000
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new BlockchainError(`Transaction confirmation timeout after ${timeout}ms`, 'CONFIRMATION_TIMEOUT'));
            }, timeout);

            const checkConfirmation = async () => {
                try {
                    const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);

                    if (receipt) {
                        const currentBlock = await this.web3.eth.getBlockNumber();
                        const confirmationCount = currentBlock - receipt.blockNumber + 1;

                        if (confirmationCount >= confirmations) {
                            clearTimeout(timeoutId);
                            resolve(receipt);
                            return;
                        }
                    }

                    // Check again in 2 seconds
                    setTimeout(checkConfirmation, 2000);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(new BlockchainError(`Error checking transaction confirmation: ${error}`));
                }
            };

            checkConfirmation();
        });
    }
}