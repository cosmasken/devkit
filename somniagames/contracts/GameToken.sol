// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GameToken
 * @dev ERC20 token for in-game currency in SomniaGames
 */
contract GameToken is ERC20, Ownable, Pausable {
    // Mapping from address to last claim time
    mapping(address => uint256) public lastClaimTime;
    
    // Daily claim amount
    uint256 public dailyClaimAmount;
    
    // Claim cooldown period (24 hours)
    uint256 public claimCooldown;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount);
    event DailyClaimAmountUpdated(uint256 newAmount);
    event ClaimCooldownUpdated(uint256 newCooldown);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _dailyClaimAmount,
        uint256 _claimCooldown
    ) ERC20(name, symbol) {
        dailyClaimAmount = _dailyClaimAmount;
        claimCooldown = _claimCooldown;
        
        // Mint initial supply to owner
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    /**
     * @dev Claim daily tokens
     */
    function claimDailyTokens() public whenNotPaused {
        require(dailyClaimAmount > 0, "Daily claim is disabled");
        require(block.timestamp >= lastClaimTime[msg.sender] + claimCooldown, "Claim cooldown not expired");
        
        lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, dailyClaimAmount * 10**decimals());
        
        emit TokensClaimed(msg.sender, dailyClaimAmount * 10**decimals());
    }
    
    /**
     * @dev Mint new tokens
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10**decimals());
    }
    
    /**
     * @dev Burn tokens
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount * 10**decimals());
    }
    
    /**
     * @dev Burn tokens from own address
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount * 10**decimals());
    }
    
    /**
     * @dev Update daily claim amount
     * @param _dailyClaimAmount New daily claim amount
     */
    function updateDailyClaimAmount(uint256 _dailyClaimAmount) public onlyOwner {
        dailyClaimAmount = _dailyClaimAmount;
        emit DailyClaimAmountUpdated(_dailyClaimAmount);
    }
    
    /**
     * @dev Update claim cooldown period
     * @param _claimCooldown New claim cooldown period (in seconds)
     */
    function updateClaimCooldown(uint256 _claimCooldown) public onlyOwner {
        claimCooldown = _claimCooldown;
        emit ClaimCooldownUpdated(_claimCooldown);
    }
    
    /**
     * @dev Pause token transfers and claims
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers and claims
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Transfer tokens
     * @param to Address to transfer to
     * @param amount Amount to transfer
     * @return True if transfer successful
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Transfer tokens from one address to another
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     * @return True if transfer successful
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}