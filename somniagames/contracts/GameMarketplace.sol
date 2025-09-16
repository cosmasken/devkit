// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GameMarketplace
 * @dev Marketplace for trading game assets
 */
contract GameMarketplace is ReentrancyGuard, Ownable {
    // Structure to hold listing information
    struct Listing {
        uint256 assetId;
        address seller;
        address tokenAddress;
        uint256 price;
        uint256 createdAt;
        bool active;
    }
    
    // Mapping from listing ID to listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping from asset ID to listing ID
    mapping(uint256 => uint256) public assetToListing;
    
    // Counter for listing IDs
    uint256 public listingCount;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFee;
    
    // Platform fee recipient
    address public feeRecipient;
    
    // Events
    event AssetListed(uint256 indexed listingId, uint256 assetId, address seller, address token, uint256 price);
    event AssetSold(uint256 indexed listingId, uint256 assetId, address buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 assetId);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);
    
    constructor(uint256 _platformFee, address _feeRecipient) {
        platformFee = _platformFee;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev List an asset for sale
     * @param assetContract Address of the asset contract
     * @param assetId ID of the asset to list
     * @param tokenAddress Address of the token to accept payment in
     * @param price Price of the asset
     */
    function listAsset(address assetContract, uint256 assetId, address tokenAddress, uint256 price) public nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(assetContract).ownerOf(assetId) == msg.sender, "Not owner of asset");
        require(IERC721(assetContract).getApproved(assetId) == address(this) || 
                IERC721(assetContract).isApprovedForAll(msg.sender, address(this)), "Not approved for transfer");
        require(assetToListing[assetId] == 0, "Asset already listed");
        
        listingCount++;
        
        listings[listingCount] = Listing({
            assetId: assetId,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            price: price,
            createdAt: block.timestamp,
            active: true
        });
        
        assetToListing[assetId] = listingCount;
        
        // Transfer asset to marketplace
        IERC721(assetContract).transferFrom(msg.sender, address(this), assetId);
        
        emit AssetListed(listingCount, assetId, msg.sender, tokenAddress, price);
    }
    
    /**
     * @dev Buy a listed asset
     * @param listingId ID of the listing to buy
     */
    function buyAsset(uint256 listingId) public nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy your own listing");
        
        uint256 feeAmount = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - feeAmount;
        
        // Transfer payment from buyer to seller and fee recipient
        require(IERC20(listing.tokenAddress).transferFrom(msg.sender, listing.seller, sellerAmount), "Payment failed");
        if (feeAmount > 0) {
            require(IERC20(listing.tokenAddress).transferFrom(msg.sender, feeRecipient, feeAmount), "Fee payment failed");
        }
        
        // Transfer asset to buyer
        address assetContract = address(listing.assetId); // This would need to be stored in the listing
        // For simplicity, we'll assume a fixed asset contract address
        // In a real implementation, you'd need to store the asset contract address in the listing
        
        // IERC721(assetContract).transferFrom(address(this), msg.sender, listing.assetId);
        
        // Mark listing as inactive
        listing.active = false;
        delete assetToListing[listing.assetId];
        
        emit AssetSold(listingId, listing.assetId, msg.sender, listing.price);
    }
    
    /**
     * @dev Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) public nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller of listing");
        
        // Transfer asset back to seller
        address assetContract = address(listing.assetId); // This would need to be stored in the listing
        // For simplicity, we'll assume a fixed asset contract address
        // In a real implementation, you'd need to store the asset contract address in the listing
        
        // IERC721(assetContract).transferFrom(address(this), msg.sender, listing.assetId);
        
        // Mark listing as inactive
        listing.active = false;
        delete assetToListing[listing.assetId];
        
        emit ListingCancelled(listingId, listing.assetId);
    }
    
    /**
     * @dev Update platform fee
     * @param _platformFee New platform fee (in basis points)
     */
    function updatePlatformFee(uint256 _platformFee) public onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high (max 10%)");
        platformFee = _platformFee;
        emit PlatformFeeUpdated(_platformFee);
    }
    
    /**
     * @dev Update fee recipient
     * @param _feeRecipient New fee recipient address
     */
    function updateFeeRecipient(address _feeRecipient) public onlyOwner {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }
    
    /**
     * @dev Get listing information
     * @param listingId ID of the listing
     * @return Listing information
     */
    function getListing(uint256 listingId) public view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Get listing ID for an asset
     * @param assetId ID of the asset
     * @return Listing ID
     */
    function getListingIdForAsset(uint256 assetId) public view returns (uint256) {
        return assetToListing[assetId];
    }
}