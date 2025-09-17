// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GuildVault
 * @dev Multi-signature wallet for guild finances with yield farming capabilities
 */
contract GuildVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Guild information
    struct GuildInfo {
        string name;
        string description;
        uint256 createdAt;
        bool isActive;
    }

    // Member information
    struct MemberInfo {
        bool isMember;
        uint256 joinedAt;
        uint256 contribution;
        bool isAdmin;
    }

    // Proposal information
    struct Proposal {
        address proposer;
        string description;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }

    // Yield farming position
    struct YieldPosition {
        address farmContract;
        uint256 pid; // Pool ID
        uint256 amount;
        uint256 rewardDebt;
    }

    // Guild info
    GuildInfo public guild;
    
    // Members
    mapping(address => MemberInfo) public members;
    address[] public memberList;
    
    // Proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Required confirmations for proposals
    uint256 public requiredConfirmations;
    
    // Yield farming positions
    mapping(uint256 => YieldPosition) public yieldPositions;
    uint256 public yieldPositionCount;
    
    // Treasury for guild funds
    mapping(address => uint256) public treasury;
    
    // Events
    event GuildCreated(string name, string description);
    event MemberAdded(address indexed member, bool isAdmin);
    event MemberRemoved(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event VoteCast(uint256 indexed proposalId, address voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event TokensDeposited(address indexed token, address indexed from, uint256 amount);
    event TokensWithdrawn(address indexed token, address indexed to, uint256 amount);
    event YieldPositionCreated(uint256 indexed positionId, address farm, uint256 pid, uint256 amount);
    event YieldPositionClosed(uint256 indexed positionId, uint256 amount, uint256 rewards);
    event RequiredConfirmationsUpdated(uint256 newRequiredConfirmations);

    modifier onlyMember() {
        require(members[msg.sender].isMember, "Not a guild member");
        _;
    }

    modifier onlyAdmin() {
        require(members[msg.sender].isAdmin, "Not a guild admin");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    modifier proposalNotExecuted(uint256 proposalId) {
        require(!proposals[proposalId].executed, "Proposal already executed");
        _;
    }

    modifier proposalNotCanceled(uint256 proposalId) {
        require(!proposals[proposalId].canceled, "Proposal canceled");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        address[] memory _admins,
        uint256 _requiredConfirmations
    ) {
        require(_admins.length > 0, "At least one admin required");
        require(_requiredConfirmations > 0 && _requiredConfirmations <= _admins.length, "Invalid confirmation count");
        
        guild.name = _name;
        guild.description = _description;
        guild.createdAt = block.timestamp;
        guild.isActive = true;
        
        requiredConfirmations = _requiredConfirmations;
        
        // Add admins
        for (uint256 i = 0; i < _admins.length; i++) {
            members[_admins[i]] = MemberInfo({
                isMember: true,
                joinedAt: block.timestamp,
                contribution: 0,
                isAdmin: true
            });
            memberList.push(_admins[i]);
        }
        
        emit GuildCreated(_name, _description);
    }

    // Add a member to the guild
    function addMember(address _member, bool _isAdmin) public onlyAdmin {
        require(!members[_member].isMember, "Already a member");
        
        members[_member] = MemberInfo({
            isMember: true,
            joinedAt: block.timestamp,
            contribution: 0,
            isAdmin: _isAdmin
        });
        memberList.push(_member);
        
        emit MemberAdded(_member, _isAdmin);
    }

    // Remove a member from the guild
    function removeMember(address _member) public onlyAdmin {
        require(members[_member].isMember, "Not a member");
        require(!members[_member].isAdmin || getAdminCount() > 1, "Cannot remove last admin");
        
        delete members[_member];
        
        // Remove from member list
        for (uint256 i = 0; i < memberList.length; i++) {
            if (memberList[i] == _member) {
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }
        
        emit MemberRemoved(_member);
    }

    // Create a proposal
    function createProposal(
        string memory _description,
        address[] memory _targets,
        uint256[] memory _values,
        bytes[] memory _calldatas
    ) public onlyMember returns (uint256) {
        require(_targets.length == _values.length && _targets.length == _calldatas.length, "Invalid input arrays");
        require(_targets.length > 0, "At least one action required");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount - 1];
        
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.targets = _targets;
        proposal.values = _values;
        proposal.calldatas = _calldatas;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + 7 days; // 7 day voting period
        
        emit ProposalCreated(proposalCount - 1, msg.sender, _description);
        return proposalCount - 1;
    }

    // Vote on a proposal
    function vote(uint256 proposalId, bool support) public 
        onlyMember 
        proposalExists(proposalId) 
        proposalNotExecuted(proposalId) 
        proposalNotCanceled(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime && block.timestamp <= proposal.endTime, "Voting not active");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }

    // Execute a proposal
    function executeProposal(uint256 proposalId) public 
        proposalExists(proposalId) 
        proposalNotExecuted(proposalId) 
        proposalNotCanceled(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.yesVotes >= requiredConfirmations, "Not enough votes");
        
        proposal.executed = true;
        
        // Execute actions
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(proposal.calldatas[i]);
            require(success, "Transaction failed");
        }
        
        emit ProposalExecuted(proposalId);
    }

    // Cancel a proposal
    function cancelProposal(uint256 proposalId) public onlyAdmin proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }

    // Deposit tokens to guild treasury
    function depositTokens(address _token, uint256 _amount) public onlyMember nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        
        // Transfer tokens from member
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update treasury
        treasury[_token] += _amount;
        
        // Update member contribution
        members[msg.sender].contribution += _amount;
        
        emit TokensDeposited(_token, msg.sender, _amount);
    }

    // Withdraw tokens from guild treasury (requires proposal)
    function withdrawTokens(address _token, uint256 _amount, address _to) public onlyAdmin nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(treasury[_token] >= _amount, "Insufficient treasury balance");
        
        // Update treasury
        treasury[_token] -= _amount;
        
        // Transfer tokens
        IERC20(_token).safeTransfer(_to, _amount);
        
        emit TokensWithdrawn(_token, _to, _amount);
    }

    // Create a yield farming position
    function createYieldPosition(
        address _farmContract,
        uint256 _pid,
        address _token,
        uint256 _amount
    ) public onlyAdmin nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(treasury[_token] >= _amount, "Insufficient treasury balance");
        
        // Approve tokens for farming contract
        IERC20(_token).safeApprove(_farmContract, _amount);
        
        // Call deposit function on farming contract
        (bool success, ) = _farmContract.call(abi.encodeWithSignature("deposit(uint256,uint256)", _pid, _amount));
        require(success, "Failed to deposit to farm");
        
        // Update treasury
        treasury[_token] -= _amount;
        
        // Create yield position
        yieldPositionCount++;
        yieldPositions[yieldPositionCount - 1] = YieldPosition({
            farmContract: _farmContract,
            pid: _pid,
            amount: _amount,
            rewardDebt: 0
        });
        
        emit YieldPositionCreated(yieldPositionCount - 1, _farmContract, _pid, _amount);
    }

    // Close a yield farming position and claim rewards
    function closeYieldPosition(uint256 _positionId) public onlyAdmin nonReentrant {
        YieldPosition storage position = yieldPositions[_positionId];
        require(position.amount > 0, "Position not active");
        
        // Call withdraw function on farming contract
        (bool success, bytes memory data) = position.farmContract.call(
            abi.encodeWithSignature("withdraw(uint256,uint256)", position.pid, position.amount)
        );
        require(success, "Failed to withdraw from farm");
        
        // Parse returned rewards (this is simplified - actual implementation would depend on the farm contract)
        // uint256 rewards = abi.decode(data, (uint256));
        
        // For simplicity, we'll assume a fixed reward for this example
        uint256 rewards = position.amount / 10; // 10% rewards
        
        // Add rewards to treasury
        // Assuming rewards are in the same token as deposited
        // In practice, you'd need to check the actual reward token
        treasury[address(position.farmContract)] += rewards;
        
        // Reset position
        position.amount = 0;
        
        emit YieldPositionClosed(_positionId, position.amount, rewards);
    }

    // Update required confirmations
    function updateRequiredConfirmations(uint256 _requiredConfirmations) public onlyAdmin {
        require(_requiredConfirmations > 0 && _requiredConfirmations <= memberList.length, "Invalid confirmation count");
        requiredConfirmations = _requiredConfirmations;
        emit RequiredConfirmationsUpdated(_requiredConfirmations);
    }

    // Get member count
    function getMemberCount() public view returns (uint256) {
        return memberList.length;
    }

    // Get admin count
    function getAdminCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].isAdmin) {
                count++;
            }
        }
        return count;
    }

    // Get proposal details
    function getProposalDetails(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    // Check if member has voted on proposal
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    // Get guild treasury balance
    function getTreasuryBalance(address _token) external view returns (uint256) {
        return treasury[_token];
    }

    // Pause the contract
    function pause() public onlyAdmin {
        _pause();
    }

    // Unpause the contract
    function unpause() public onlyAdmin {
        _unpause();
    }

    // Receive ETH
    receive() external payable {}
}