import { ethers, Contract } from 'ethers';
import { Module } from './Module';

/**
 * GuildModule - Module for interacting with guild vault contracts
 */
export class GuildModule extends Module {
  private guildVaultContract: Contract | null = null;

  constructor(walletConnector: any) {
    super(walletConnector);
  }

  /**
   * Initialize the guild module with contract address
   * @param guildVaultAddress Address of the GuildVault contract
   */
  async initialize(guildVaultAddress: string): Promise<void> {
    if (!this.walletConnector.provider) {
      throw new Error('Wallet not connected');
    }

    // Initialize contracts
    const guildVaultABI = [
      // Guild info
      "function guild() view returns (string name, string description, uint256 createdAt, bool isActive)",
      "function members(address) view returns (bool isMember, uint256 joinedAt, uint256 contribution, bool isAdmin)",
      "function memberList(uint256) view returns (address)",
      "function getMemberCount() view returns (uint256)",
      "function getAdminCount() view returns (uint256)",
      
      // Member functions
      "function addMember(address _member, bool _isAdmin)",
      "function removeMember(address _member)",
      
      // Proposal functions
      "function proposals(uint256) view returns (address proposer, string description, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool executed, bool canceled)",
      "function proposalCount() view returns (uint256)",
      "function createProposal(string memory _description, address[] memory _targets, uint256[] memory _values, bytes[] memory _calldatas) returns (uint256)",
      "function vote(uint256 proposalId, bool support)",
      "function executeProposal(uint256 proposalId)",
      "function cancelProposal(uint256 proposalId)",
      "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
      "function getProposalDetails(uint256 proposalId) view returns (address proposer, string description, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool executed, bool canceled)",
      
      // Treasury functions
      "function treasury(address) view returns (uint256)",
      "function depositTokens(address _token, uint256 _amount)",
      "function withdrawTokens(address _token, uint256 _amount, address _to)",
      "function getTreasuryBalance(address _token) view returns (uint256)",
      
      // Yield farming functions
      "function yieldPositions(uint256) view returns (address farmContract, uint256 pid, uint256 amount, uint256 rewardDebt)",
      "function yieldPositionCount() view returns (uint256)",
      "function createYieldPosition(address _farmContract, uint256 _pid, address _token, uint256 _amount)",
      "function closeYieldPosition(uint256 _positionId)",
      
      // Configuration functions
      "function requiredConfirmations() view returns (uint256)",
      "function updateRequiredConfirmations(uint256 _requiredConfirmations)"
    ];

    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address, uint256) returns (bool)",
      "function transfer(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ];

    this.guildVaultContract = new ethers.Contract(
      guildVaultAddress,
      guildVaultABI,
      this.walletConnector.signer || this.walletConnector.provider
    );

    console.log('GuildModule initialized');
  }

  /**
   * Get guild information
   * @returns Guild information
   */
  async getGuildInfo(): Promise<any> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const guildInfo = await this.guildVaultContract.guild();
      return {
        name: guildInfo.name,
        description: guildInfo.description,
        createdAt: guildInfo.createdAt.toString(),
        isActive: guildInfo.isActive
      };
    } catch (error) {
      throw new Error(`Failed to get guild info: ${error}`);
    }
  }

  /**
   * Get member information
   * @param memberAddress Address of the member
   * @returns Member information
   */
  async getMemberInfo(memberAddress: string): Promise<any> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const memberInfo = await this.guildVaultContract.members(memberAddress);
      return {
        isMember: memberInfo.isMember,
        joinedAt: memberInfo.joinedAt.toString(),
        contribution: memberInfo.contribution.toString(),
        isAdmin: memberInfo.isAdmin
      };
    } catch (error) {
      throw new Error(`Failed to get member info: ${error}`);
    }
  }

  /**
   * Get member list
   * @returns List of member addresses
   */
  async getMemberList(): Promise<string[]> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const memberCount = await this.guildVaultContract.getMemberCount();
      const members: string[] = [];
      
      for (let i = 0; i < memberCount; i++) {
        const member = await this.guildVaultContract.memberList(i);
        members.push(member);
      }
      
      return members;
    } catch (error) {
      throw new Error(`Failed to get member list: ${error}`);
    }
  }

  /**
   * Get member count
   * @returns Number of members
   */
  async getMemberCount(): Promise<number> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const count = await this.guildVaultContract.getMemberCount();
      return count.toNumber();
    } catch (error) {
      throw new Error(`Failed to get member count: ${error}`);
    }
  }

  /**
   * Get admin count
   * @returns Number of admins
   */
  async getAdminCount(): Promise<number> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const count = await this.guildVaultContract.getAdminCount();
      return count.toNumber();
    } catch (error) {
      throw new Error(`Failed to get admin count: ${error}`);
    }
  }

  /**
   * Add a member to the guild
   * @param memberAddress Address of the member to add
   * @param isAdmin Whether the member should be an admin
   * @returns Transaction hash
   */
  async addMember(memberAddress: string, isAdmin: boolean): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const addTx = await this.guildVaultContract.addMember(memberAddress, isAdmin);
      await addTx.wait();
      
      return addTx.hash;
    } catch (error) {
      throw new Error(`Failed to add member: ${error}`);
    }
  }

  /**
   * Remove a member from the guild
   * @param memberAddress Address of the member to remove
   * @returns Transaction hash
   */
  async removeMember(memberAddress: string): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const removeTx = await this.guildVaultContract.removeMember(memberAddress);
      await removeTx.wait();
      
      return removeTx.hash;
    } catch (error) {
      throw new Error(`Failed to remove member: ${error}`);
    }
  }

  /**
   * Create a proposal
   * @param description Description of the proposal
   * @param targets Target addresses for the actions
   * @param values ETH values for the actions
   * @param calldatas Calldata for the actions
   * @returns Proposal ID
   */
  async createProposal(
    description: string,
    targets: string[],
    values: string[],
    calldatas: string[]
  ): Promise<number> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      // Convert values to BigNumber
      const valuesBN = values.map(value => ethers.utils.parseEther(value));
      
      const createTx = await this.guildVaultContract.createProposal(
        description,
        targets,
        valuesBN,
        calldatas
      );
      const receipt = await createTx.wait();
      
      // Extract proposal ID from event logs
      const proposalCreatedEvent = receipt.events?.find((event: any) => event.event === "ProposalCreated");
      const proposalId = proposalCreatedEvent?.args?.proposalId;
      
      return proposalId ? proposalId.toNumber() : 0;
    } catch (error) {
      throw new Error(`Failed to create proposal: ${error}`);
    }
  }

  /**
   * Vote on a proposal
   * @param proposalId ID of the proposal
   * @param support Whether to vote yes or no
   * @returns Transaction hash
   */
  async vote(proposalId: number, support: boolean): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const voteTx = await this.guildVaultContract.vote(proposalId, support);
      await voteTx.wait();
      
      return voteTx.hash;
    } catch (error) {
      throw new Error(`Failed to vote on proposal: ${error}`);
    }
  }

  /**
   * Execute a proposal
   * @param proposalId ID of the proposal
   * @returns Transaction hash
   */
  async executeProposal(proposalId: number): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const executeTx = await this.guildVaultContract.executeProposal(proposalId);
      await executeTx.wait();
      
      return executeTx.hash;
    } catch (error) {
      throw new Error(`Failed to execute proposal: ${error}`);
    }
  }

  /**
   * Cancel a proposal
   * @param proposalId ID of the proposal
   * @returns Transaction hash
   */
  async cancelProposal(proposalId: number): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const cancelTx = await this.guildVaultContract.cancelProposal(proposalId);
      await cancelTx.wait();
      
      return cancelTx.hash;
    } catch (error) {
      throw new Error(`Failed to cancel proposal: ${error}`);
    }
  }

  /**
   * Check if a member has voted on a proposal
   * @param proposalId ID of the proposal
   * @param voterAddress Address of the voter
   * @returns Whether the member has voted
   */
  async hasVoted(proposalId: number, voterAddress: string): Promise<boolean> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      return await this.guildVaultContract.hasVoted(proposalId, voterAddress);
    } catch (error) {
      throw new Error(`Failed to check voting status: ${error}`);
    }
  }

  /**
   * Get proposal details
   * @param proposalId ID of the proposal
   * @returns Proposal details
   */
  async getProposalDetails(proposalId: number): Promise<any> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const proposalDetails = await this.guildVaultContract.getProposalDetails(proposalId);
      return {
        proposer: proposalDetails.proposer,
        description: proposalDetails.description,
        startTime: proposalDetails.startTime.toString(),
        endTime: proposalDetails.endTime.toString(),
        yesVotes: proposalDetails.yesVotes.toString(),
        noVotes: proposalDetails.noVotes.toString(),
        executed: proposalDetails.executed,
        canceled: proposalDetails.canceled
      };
    } catch (error) {
      throw new Error(`Failed to get proposal details: ${error}`);
    }
  }

  /**
   * Get treasury balance
   * @param tokenAddress Address of the token
   * @returns Treasury balance
   */
  async getTreasuryBalance(tokenAddress: string): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const balance = await this.guildVaultContract.getTreasuryBalance(tokenAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get treasury balance: ${error}`);
    }
  }

  /**
   * Deposit tokens to guild treasury
   * @param tokenAddress Address of the token
   * @param amount Amount to deposit
   * @returns Transaction hash
   */
  async depositTokens(tokenAddress: string, amount: string): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      const depositTx = await this.guildVaultContract.depositTokens(tokenAddress, amountWei);
      await depositTx.wait();
      
      return depositTx.hash;
    } catch (error) {
      throw new Error(`Failed to deposit tokens: ${error}`);
    }
  }

  /**
   * Withdraw tokens from guild treasury
   * @param tokenAddress Address of the token
   * @param amount Amount to withdraw
   * @param to Address to send tokens to
   * @returns Transaction hash
   */
  async withdrawTokens(tokenAddress: string, amount: string, to: string): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      const withdrawTx = await this.guildVaultContract.withdrawTokens(tokenAddress, amountWei, to);
      await withdrawTx.wait();
      
      return withdrawTx.hash;
    } catch (error) {
      throw new Error(`Failed to withdraw tokens: ${error}`);
    }
  }

  /**
   * Create a yield farming position
   * @param farmContract Address of the farming contract
   * @param pid Pool ID
   * @param tokenAddress Address of the token to stake
   * @param amount Amount to stake
   * @returns Transaction hash
   */
  async createYieldPosition(
    farmContract: string,
    pid: number,
    tokenAddress: string,
    amount: string
  ): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      const createTx = await this.guildVaultContract.createYieldPosition(
        farmContract,
        pid,
        tokenAddress,
        amountWei
      );
      await createTx.wait();
      
      return createTx.hash;
    } catch (error) {
      throw new Error(`Failed to create yield position: ${error}`);
    }
  }

  /**
   * Close a yield farming position
   * @param positionId ID of the position
   * @returns Transaction hash
   */
  async closeYieldPosition(positionId: number): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const closeTx = await this.guildVaultContract.closeYieldPosition(positionId);
      await closeTx.wait();
      
      return closeTx.hash;
    } catch (error) {
      throw new Error(`Failed to close yield position: ${error}`);
    }
  }

  /**
   * Get yield position info
   * @param positionId ID of the position
   * @returns Position information
   */
  async getYieldPosition(positionId: number): Promise<any> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const position = await this.guildVaultContract.yieldPositions(positionId);
      return {
        farmContract: position.farmContract,
        pid: position.pid.toString(),
        amount: ethers.utils.formatEther(position.amount),
        rewardDebt: position.rewardDebt.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get yield position: ${error}`);
    }
  }

  /**
   * Get required confirmations for proposals
   * @returns Required confirmations
   */
  async getRequiredConfirmations(): Promise<number> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const confirmations = await this.guildVaultContract.requiredConfirmations();
      return confirmations.toNumber();
    } catch (error) {
      throw new Error(`Failed to get required confirmations: ${error}`);
    }
  }

  /**
   * Update required confirmations
   * @param requiredConfirmations New required confirmations
   * @returns Transaction hash
   */
  async updateRequiredConfirmations(requiredConfirmations: number): Promise<string> {
    if (!this.guildVaultContract) {
      throw new Error('GuildModule not initialized');
    }

    try {
      const updateTx = await this.guildVaultContract.updateRequiredConfirmations(requiredConfirmations);
      await updateTx.wait();
      
      return updateTx.hash;
    } catch (error) {
      throw new Error(`Failed to update required confirmations: ${error}`);
    }
  }
}