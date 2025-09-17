import { ethers, Contract } from 'ethers';
import { Module } from './Module';

/**
 * LendingModule - Module for interacting with lending pool contracts
 */
export class LendingModule extends Module {
  private lendingPoolContract: Contract | null = null;
  private lendingTokenContract: Contract | null = null;

  constructor(walletConnector: any) {
    super(walletConnector);
  }

  /**
   * Initialize the lending module with contract addresses
   * @param lendingPoolAddress Address of the LendingPool contract
   * @param lendingTokenAddress Address of the lending token contract
   */
  async initialize(lendingPoolAddress: string, lendingTokenAddress: string): Promise<void> {
    if (!this.walletConnector.provider) {
      throw new Error('Wallet not connected');
    }

    // Initialize contracts
    const lendingPoolABI = [
      // Loan info
      "function loans(uint256) view returns (address borrower, uint256 collateralId, address collateralAddress, uint256 borrowedAmount, uint256 interestRate, uint256 startTime, uint256 endTime, bool isActive, bool isLiquidated)",
      "function loanCounter() view returns (uint256)",
      
      // User functions
      "function createLoan(address _collateralAddress, uint256 _collateralId, uint256 _borrowAmount, uint256 _duration)",
      "function repayLoan(uint256 _loanId)",
      "function liquidateLoan(uint256 _loanId)",
      "function calculateInterest(uint256 _loanId) view returns (uint256)",
      "function getTotalDue(uint256 _loanId) view returns (uint256)",
      "function canLiquidate(uint256 _loanId) view returns (bool)",
      
      // Asset and collateral info
      "function assets(address) view returns (bool isListed, uint256 maxLTV, uint256 liquidationThreshold, uint256 minLoanAmount, uint256 maxLoanAmount, uint256 interestRate)",
      "function collaterals(address) view returns (bool isListed, uint256 baseLTV, uint256 liquidationThreshold)"
    ];

    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address, uint256) returns (bool)",
      "function transfer(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ];

    const erc721ABI = [
      "function ownerOf(uint256) view returns (address)",
      "function transferFrom(address, address, uint256)",
      "function approve(address, uint256)",
      "function setApprovalForAll(address, bool)"
    ];

    this.lendingPoolContract = new ethers.Contract(
      lendingPoolAddress,
      lendingPoolABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    this.lendingTokenContract = new ethers.Contract(
      lendingTokenAddress,
      erc20ABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    console.log('LendingModule initialized');
  }

  /**
   * Get loan information
   * @param loanId ID of the loan
   * @returns Loan information
   */
  async getLoanInfo(loanId: number): Promise<any> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      const loanInfo = await this.lendingPoolContract.loans(loanId);
      return {
        borrower: loanInfo.borrower,
        collateralId: loanInfo.collateralId.toString(),
        collateralAddress: loanInfo.collateralAddress,
        borrowedAmount: ethers.utils.formatEther(loanInfo.borrowedAmount),
        interestRate: loanInfo.interestRate.toString(),
        startTime: loanInfo.startTime.toString(),
        endTime: loanInfo.endTime.toString(),
        isActive: loanInfo.isActive,
        isLiquidated: loanInfo.isLiquidated
      };
    } catch (error) {
      throw new Error(`Failed to get loan info: ${error}`);
    }
  }

  /**
   * Get total amount due for a loan
   * @param loanId ID of the loan
   * @returns Total amount due
   */
  async getTotalDue(loanId: number): Promise<string> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      const totalDue = await this.lendingPoolContract.getTotalDue(loanId);
      return ethers.utils.formatEther(totalDue);
    } catch (error) {
      throw new Error(`Failed to get total due: ${error}`);
    }
  }

  /**
   * Check if a loan can be liquidated
   * @param loanId ID of the loan
   * @returns Whether the loan can be liquidated
   */
  async canLiquidate(loanId: number): Promise<boolean> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      return await this.lendingPoolContract.canLiquidate(loanId);
    } catch (error) {
      throw new Error(`Failed to check liquidation status: ${error}`);
    }
  }

  /**
   * Create a loan
   * @param collateralAddress Address of the collateral NFT contract
   * @param collateralId ID of the collateral NFT
   * @param borrowAmount Amount to borrow
   * @param duration Duration of the loan in seconds
   * @returns Transaction hash
   */
  async createLoan(
    collateralAddress: string,
    collateralId: number,
    borrowAmount: string,
    duration: number
  ): Promise<string> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      // Convert borrow amount to wei
      const borrowAmountWei = ethers.utils.parseEther(borrowAmount);
      
      // Create loan
      const createTx = await this.lendingPoolContract.createLoan(
        collateralAddress,
        collateralId,
        borrowAmountWei,
        duration
      );
      await createTx.wait();
      
      return createTx.hash;
    } catch (error) {
      throw new Error(`Failed to create loan: ${error}`);
    }
  }

  /**
   * Repay a loan
   * @param loanId ID of the loan
   * @param totalAmount Total amount to repay
   * @returns Transaction hash
   */
  async repayLoan(loanId: number, totalAmount: string): Promise<string> {
    if (!this.lendingPoolContract || !this.lendingTokenContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      // Convert total amount to wei
      const totalAmountWei = ethers.utils.parseEther(totalAmount);
      
      // Approve tokens for the lending pool
      const approveTx = await this.lendingTokenContract.approve(
        this.lendingPoolContract.address,
        totalAmountWei
      );
      await approveTx.wait();
      
      // Repay loan
      const repayTx = await this.lendingPoolContract.repayLoan(loanId);
      await repayTx.wait();
      
      return repayTx.hash;
    } catch (error) {
      throw new Error(`Failed to repay loan: ${error}`);
    }
  }

  /**
   * Liquidate a loan
   * @param loanId ID of the loan
   * @returns Transaction hash
   */
  async liquidateLoan(loanId: number): Promise<string> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      // Liquidate loan
      const liquidateTx = await this.lendingPoolContract.liquidateLoan(loanId);
      await liquidateTx.wait();
      
      return liquidateTx.hash;
    } catch (error) {
      throw new Error(`Failed to liquidate loan: ${error}`);
    }
  }

  /**
   * Get asset information
   * @param assetAddress Address of the asset
   * @returns Asset information
   */
  async getAssetInfo(assetAddress: string): Promise<any> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      const assetInfo = await this.lendingPoolContract.assets(assetAddress);
      return {
        isListed: assetInfo.isListed,
        maxLTV: assetInfo.maxLTV.toString(),
        liquidationThreshold: assetInfo.liquidationThreshold.toString(),
        minLoanAmount: ethers.utils.formatEther(assetInfo.minLoanAmount),
        maxLoanAmount: ethers.utils.formatEther(assetInfo.maxLoanAmount),
        interestRate: assetInfo.interestRate.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get asset info: ${error}`);
    }
  }

  /**
   * Get collateral information
   * @param collateralAddress Address of the collateral
   * @returns Collateral information
   */
  async getCollateralInfo(collateralAddress: string): Promise<any> {
    if (!this.lendingPoolContract) {
      throw new Error('LendingModule not initialized');
    }

    try {
      const collateralInfo = await this.lendingPoolContract.collaterals(collateralAddress);
      return {
        isListed: collateralInfo.isListed,
        baseLTV: collateralInfo.baseLTV.toString(),
        liquidationThreshold: collateralInfo.liquidationThreshold.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get collateral info: ${error}`);
    }
  }
}