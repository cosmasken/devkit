// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LendingPool
 * @dev Lending pool contract for borrowing game assets with NFT collateral
 */
contract LendingPool is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Info of each loan.
    struct LoanInfo {
        address borrower;           // Address of borrower
        uint256 collateralId;       // ID of NFT collateral
        address collateralAddress;  // Address of NFT contract
        uint256 borrowedAmount;     // Amount of tokens borrowed
        uint256 interestRate;       // Annual interest rate (in basis points)
        uint256 startTime;          // Time when loan was taken
        uint256 endTime;            // Time when loan must be repaid
        bool isActive;              // Whether loan is active
        bool isLiquidated;          // Whether loan has been liquidated
    }

    // Asset information
    struct AssetInfo {
        bool isListed;              // Whether asset is listed for borrowing
        uint256 maxLTV;             // Maximum loan-to-value ratio (in basis points)
        uint256 liquidationThreshold; // Liquidation threshold (in basis points)
        uint256 minLoanAmount;      // Minimum loan amount
        uint256 maxLoanAmount;      // Maximum loan amount
        uint256 interestRate;       // Base interest rate (in basis points)
    }

    // Collateral information
    struct CollateralInfo {
        bool isListed;              // Whether collateral is accepted
        uint256 baseLTV;            // Base loan-to-value ratio (in basis points)
        uint256 liquidationThreshold; // Liquidation threshold (in basis points)
    }

    // The token being lent
    IERC20 public immutable lendingToken;
    
    // Mapping of loan ID to loan info
    mapping(uint256 => LoanInfo) public loans;
    
    // Mapping of asset address to asset info
    mapping(address => AssetInfo) public assets;
    
    // Mapping of collateral address to collateral info
    mapping(address => CollateralInfo) public collaterals;
    
    // Total loans counter
    uint256 public loanCounter;
    
    // Treasury address for fees
    address public treasury;
    
    // Protocol fee (in basis points)
    uint256 public protocolFee = 50; // 0.5%
    
    // Late fee (in basis points)
    uint256 public lateFee = 100; // 1%
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        address collateralAddress,
        uint256 collateralId,
        uint256 borrowedAmount,
        uint256 interestRate,
        uint256 endTime
    );
    event LoanRepaid(uint256 indexed loanId, uint256 totalAmount);
    event LoanLiquidated(uint256 indexed loanId, address liquidator);
    event AssetListed(address indexed asset, uint256 maxLTV, uint256 liquidationThreshold);
    event CollateralListed(address indexed collateral, uint256 baseLTV, uint256 liquidationThreshold);
    event TreasuryUpdated(address newTreasury);
    event ProtocolFeeUpdated(uint256 newFee);
    event LateFeeUpdated(uint256 newFee);

    constructor(IERC20 _lendingToken, address _treasury) {
        lendingToken = _lendingToken;
        treasury = _treasury;
    }

    // List an asset for borrowing
    function listAsset(
        address _asset,
        uint256 _maxLTV,
        uint256 _liquidationThreshold,
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount,
        uint256 _interestRate
    ) public onlyOwner {
        require(_maxLTV <= 9000, "LTV too high"); // Max 90%
        require(_liquidationThreshold > _maxLTV, "Invalid liquidation threshold");
        require(_minLoanAmount > 0, "Min loan amount must be > 0");
        require(_maxLoanAmount > _minLoanAmount, "Max loan amount must be > min");
        
        assets[_asset] = AssetInfo({
            isListed: true,
            maxLTV: _maxLTV,
            liquidationThreshold: _liquidationThreshold,
            minLoanAmount: _minLoanAmount,
            maxLoanAmount: _maxLoanAmount,
            interestRate: _interestRate
        });
        
        emit AssetListed(_asset, _maxLTV, _liquidationThreshold);
    }

    // List a collateral type
    function listCollateral(
        address _collateral,
        uint256 _baseLTV,
        uint256 _liquidationThreshold
    ) public onlyOwner {
        require(_baseLTV <= 9000, "LTV too high"); // Max 90%
        require(_liquidationThreshold > _baseLTV, "Invalid liquidation threshold");
        
        collaterals[_collateral] = CollateralInfo({
            isListed: true,
            baseLTV: _baseLTV,
            liquidationThreshold: _liquidationThreshold
        });
        
        emit CollateralListed(_collateral, _baseLTV, _liquidationThreshold);
    }

    // Create a loan
    function createLoan(
        address _collateralAddress,
        uint256 _collateralId,
        uint256 _borrowAmount,
        uint256 _duration // in seconds
    ) public whenNotPaused nonReentrant {
        // Check if collateral is listed
        CollateralInfo storage collateralInfo = collaterals[_collateralAddress];
        require(collateralInfo.isListed, "Collateral not listed");
        
        // Check if asset is listed (assuming lendingToken is the only asset for now)
        // In a more complex system, you would check the asset being borrowed
        
        // Validate loan amount
        require(_borrowAmount >= assets[address(lendingToken)].minLoanAmount, "Loan amount too small");
        require(_borrowAmount <= assets[address(lendingToken)].maxLoanAmount, "Loan amount too large");
        
        // Transfer NFT collateral to contract
        IERC721(_collateralAddress).transferFrom(msg.sender, address(this), _collateralId);
        
        // Calculate interest rate
        uint256 interestRate = assets[address(lendingToken)].interestRate;
        
        // Create loan
        loanCounter++;
        loans[loanCounter] = LoanInfo({
            borrower: msg.sender,
            collateralId: _collateralId,
            collateralAddress: _collateralAddress,
            borrowedAmount: _borrowAmount,
            interestRate: interestRate,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            isActive: true,
            isLiquidated: false
        });
        
        // Transfer borrowed tokens to borrower
        lendingToken.safeTransfer(msg.sender, _borrowAmount);
        
        emit LoanCreated(
            loanCounter,
            msg.sender,
            _collateralAddress,
            _collateralId,
            _borrowAmount,
            interestRate,
            block.timestamp + _duration
        );
    }

    // Repay a loan
    function repayLoan(uint256 _loanId) public whenNotPaused nonReentrant {
        LoanInfo storage loan = loans[_loanId];
        require(loan.isActive, "Loan not active");
        require(!loan.isLiquidated, "Loan liquidated");
        require(msg.sender == loan.borrower || msg.sender == owner(), "Not authorized");
        
        // Calculate total amount to repay
        uint256 interest = calculateInterest(_loanId);
        uint256 totalAmount = loan.borrowedAmount + interest;
        
        // Transfer tokens from borrower
        lendingToken.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        // Transfer protocol fee to treasury
        uint256 fee = totalAmount * protocolFee / 10000;
        lendingToken.safeTransfer(treasury, fee);
        
        // Transfer remaining to owner
        lendingToken.safeTransfer(owner(), totalAmount - fee);
        
        // Transfer NFT back to borrower
        IERC721(loan.collateralAddress).transferFrom(address(this), loan.borrower, loan.collateralId);
        
        // Mark loan as inactive
        loan.isActive = false;
        
        emit LoanRepaid(_loanId, totalAmount);
    }

    // Liquidate an overdue loan
    function liquidateLoan(uint256 _loanId) public whenNotPaused nonReentrant {
        LoanInfo storage loan = loans[_loanId];
        require(loan.isActive, "Loan not active");
        require(!loan.isLiquidated, "Loan already liquidated");
        require(block.timestamp > loan.endTime, "Loan not overdue");
        
        // Transfer NFT to liquidator
        IERC721(loan.collateralAddress).transferFrom(address(this), msg.sender, loan.collateralId);
        
        // Mark loan as liquidated
        loan.isLiquidated = true;
        loan.isActive = false;
        
        emit LoanLiquidated(_loanId, msg.sender);
    }

    // Calculate interest for a loan
    function calculateInterest(uint256 _loanId) public view returns (uint256) {
        LoanInfo storage loan = loans[_loanId];
        if (!loan.isActive) return 0;
        
        uint256 duration = block.timestamp - loan.startTime;
        uint256 interest = loan.borrowedAmount * loan.interestRate * duration / (365 days * 10000);
        
        // Add late fee if overdue
        if (block.timestamp > loan.endTime) {
            uint256 lateDuration = block.timestamp - loan.endTime;
            uint256 lateInterest = loan.borrowedAmount * lateFee * lateDuration / (365 days * 10000);
            interest += lateInterest;
        }
        
        return interest;
    }

    // Get loan info
    function getLoanInfo(uint256 _loanId) external view returns (LoanInfo memory) {
        return loans[_loanId];
    }

    // Get total amount due for a loan
    function getTotalDue(uint256 _loanId) external view returns (uint256) {
        LoanInfo storage loan = loans[_loanId];
        if (!loan.isActive) return 0;
        
        return loan.borrowedAmount + calculateInterest(_loanId);
    }

    // Check if a loan can be liquidated
    function canLiquidate(uint256 _loanId) external view returns (bool) {
        LoanInfo storage loan = loans[_loanId];
        return loan.isActive && !loan.isLiquidated && block.timestamp > loan.endTime;
    }

    // Update treasury address
    function updateTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // Update protocol fee
    function updateProtocolFee(uint256 _protocolFee) public onlyOwner {
        require(_protocolFee <= 1000, "Fee too high"); // Max 10%
        protocolFee = _protocolFee;
        emit ProtocolFeeUpdated(_protocolFee);
    }

    // Update late fee
    function updateLateFee(uint256 _lateFee) public onlyOwner {
        require(_lateFee <= 1000, "Fee too high"); // Max 10%
        lateFee = _lateFee;
        emit LateFeeUpdated(_lateFee);
    }

    // Pause the contract
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause the contract
    function unpause() public onlyOwner {
        _unpause();
    }

    // Emergency withdrawal of tokens (only owner)
    function emergencyWithdrawTokens(IERC20 token, uint256 amount) public onlyOwner {
        token.safeTransfer(owner(), amount);
    }

    // Emergency withdrawal of NFTs (only owner)
    function emergencyWithdrawNFT(IERC721 nft, uint256 tokenId) public onlyOwner {
        nft.transferFrom(address(this), owner(), tokenId);
    }
}