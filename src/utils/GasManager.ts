/**
 * Gas estimation and management utilities
 */

import Web3 from 'web3';
import { SDKConfig, TransactionOptions } from '../core/types';
import { GasEstimationError } from '../core/errors';

export class GasManager {
    private web3: Web3;
    private config: SDKConfig;

    constructor(web3: Web3, config: SDKConfig) {
        this.web3 = web3;
        this.config = config;
    }

    /**
     * Gets the current gas price from the network
     * @returns Promise resolving to the current gas price in wei
     */
    async getGasPrice(): Promise<string> {
        try {
            const gasPrice = await this.web3.eth.getGasPrice();

            // Apply max gas price limit if configured
            if (this.config.gasSettings?.maxGasPrice) {
                const maxGasPrice = this.web3.utils.toBN(this.config.gasSettings.maxGasPrice);
                const currentGasPrice = this.web3.utils.toBN(gasPrice);

                if (currentGasPrice.gt(maxGasPrice)) {
                    console.warn(`Current gas price (${gasPrice}) exceeds maximum (${this.config.gasSettings.maxGasPrice}). Using maximum.`);
                    return this.config.gasSettings.maxGasPrice;
                }
            }

            return gasPrice;
        } catch (error: any) {
            console.warn('Gas price fetch failed, using fallback:', error.message);
            // Use configured fallback or default to 20 Gwei
            return this.config.gasSettings?.fallbackGasPrice || '20000000000';
        }
    }

    /**
     * Estimates gas for a transaction
     * @param transactionObject - The transaction object to estimate gas for
     * @returns Promise resolving to the estimated gas amount
     */
    async estimateGas(transactionObject: any): Promise<number> {
        try {
            const gasEstimate = await this.web3.eth.estimateGas(transactionObject);
            return gasEstimate;
        } catch (error: any) {
            console.warn('Gas estimation failed, using fallback:', error.message);
            
            // Use configured fallback values or defaults
            const fallbacks = this.config.gasSettings?.fallbackGasLimits;
            const contractDeploymentGas = fallbacks?.contractDeployment || 3000000;
            const contractInteractionGas = fallbacks?.contractInteraction || 500000;
            const simpleTransferGas = fallbacks?.simpleTransfer || 21000;
            
            // Fallback gas limits based on transaction type
            if (transactionObject.data && transactionObject.data.length > 1000) {
                // Contract deployment - larger gas limit
                return contractDeploymentGas;
            } else if (transactionObject.data && transactionObject.data.length > 100) {
                // Contract interaction - medium gas limit
                return contractInteractionGas;
            } else {
                // Simple transfer - small gas limit
                return simpleTransferGas;
            }
        }
    }

    /**
     * Applies gas multiplier to an estimated gas amount
     * @param gasEstimate - The base gas estimate
     * @param options - Transaction options that may override gas
     * @returns The final gas limit to use
     */
    applyGasMultiplier(gasEstimate: number, options?: TransactionOptions): number {
        if (options?.gas) {
            return options.gas;
        }

        const multiplier = this.config.gasSettings?.gasMultiplier || 1.2;
        return Math.floor(gasEstimate * multiplier);
    }

    /**
     * Prepares gas settings for a transaction
     * @param transactionObject - The transaction to estimate gas for
     * @param options - Optional transaction options
     * @returns Promise resolving to gas limit and gas price
     */
    async prepareGasSettings(transactionObject: any, options?: TransactionOptions): Promise<{
        gas: number;
        gasPrice: string;
    }> {
        // Estimate gas if not provided
        const gasEstimate = await this.estimateGas(transactionObject);
        const gasLimit = this.applyGasMultiplier(gasEstimate, options);

        // Get gas price if not provided
        const gasPrice = options?.gasPrice || await this.getGasPrice();

        return {
            gas: gasLimit,
            gasPrice
        };
    }
}