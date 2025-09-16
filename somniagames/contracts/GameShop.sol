// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title GameShop
 * @dev Shop system for in-game purchases
 */
contract GameShop is ReentrancyGuard, Ownable {
    // Structure to hold shop item
    struct ShopItem {
        uint256 id;
        string name;
        string description;
        string metadataURI;
        uint256 price;
        address tokenAddress; // Address of the token used for purchase
        uint256 gameId;
        uint256 quantity;
        uint256 maxQuantity;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }
    
    // Structure to hold purchase record
    struct PurchaseRecord {
        uint256 itemId;
        address buyer;
        uint256 quantity;
        uint256 totalPrice;
        uint256 timestamp;
    }
    
    // Mapping from item ID to shop item
    mapping(uint256 => ShopItem) public items;
    
    // Mapping from game ID to item IDs
    mapping(uint256 => uint256[]) public gameItems;
    
    // Mapping from purchase ID to purchase record
    mapping(uint256 => PurchaseRecord) public purchases;
    
    // Counter for item IDs
    uint256 public itemCount;
    
    // Counter for purchase IDs
    uint256 public purchaseCount;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFee;
    
    // Platform fee recipient
    address public feeRecipient;
    
    // Events
    event ItemCreated(uint256 indexed itemId, string name, uint256 gameId, uint256 price);
    event ItemUpdated(uint256 indexed itemId, string name, uint256 price);
    event ItemPurchased(uint256 indexed purchaseId, uint256 itemId, address buyer, uint256 quantity, uint256 totalPrice);
    event ItemActivated(uint256 indexed itemId);
    event ItemDeactivated(uint256 indexed itemId);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);
    
    constructor(uint256 _platformFee, address _feeRecipient) {
        platformFee = _platformFee;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new shop item
     * @param name Name of the item
     * @param description Description of the item
     * @param metadataURI URI to item metadata
     * @param price Price of the item
     * @param tokenAddress Address of the token used for purchase
     * @param gameId ID of the game this item belongs to
     * @param maxQuantity Maximum quantity available (-1 for unlimited)
     */
    function createItem(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 price,
        address tokenAddress,
        uint256 gameId,
        int256 maxQuantity
    ) public onlyOwner {
        itemCount++;
        
        uint256 actualMaxQuantity = maxQuantity == -1 ? type(uint256).max : uint256(maxQuantity);
        
        items[itemCount] = ShopItem({
            id: itemCount,
            name: name,
            description: description,
            metadataURI: metadataURI,
            price: price,
            tokenAddress: tokenAddress,
            gameId: gameId,
            quantity: actualMaxQuantity,
            maxQuantity: actualMaxQuantity,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });
        
        gameItems[gameId].push(itemCount);
        
        emit ItemCreated(itemCount, name, gameId, price);
    }
    
    /**
     * @dev Update shop item information
     * @param itemId ID of the item to update
     * @param name New name of the item
     * @param description New description of the item
     * @param price New price of the item
     */
    function updateItem(uint256 itemId, string memory name, string memory description, uint256 price) public onlyOwner {
        require(items[itemId].id != 0, "Item does not exist");
        
        items[itemId].name = name;
        items[itemId].description = description;
        items[itemId].price = price;
        items[itemId].updatedAt = block.timestamp;
        
        emit ItemUpdated(itemId, name, price);
    }
    
    /**
     * @dev Restock an item
     * @param itemId ID of the item to restock
     * @param quantity Quantity to add
     */
    function restockItem(uint256 itemId, uint256 quantity) public onlyOwner {
        require(items[itemId].id != 0, "Item does not exist");
        
        // Only restock if not unlimited
        if (items[itemId].maxQuantity != type(uint256).max) {
            items[itemId].quantity += quantity;
            if (items[itemId].quantity > items[itemId].maxQuantity) {
                items[itemId].quantity = items[itemId].maxQuantity;
            }
        }
        
        items[itemId].updatedAt = block.timestamp;
    }
    
    /**
     * @dev Activate an item
     * @param itemId ID of the item to activate
     */
    function activateItem(uint256 itemId) public onlyOwner {
        require(items[itemId].id != 0, "Item does not exist");
        
        items[itemId].active = true;
        items[itemId].updatedAt = block.timestamp;
        
        emit ItemActivated(itemId);
    }
    
    /**
     * @dev Deactivate an item
     * @param itemId ID of the item to deactivate
     */
    function deactivateItem(uint256 itemId) public onlyOwner {
        require(items[itemId].id != 0, "Item does not exist");
        
        items[itemId].active = false;
        items[itemId].updatedAt = block.timestamp;
        
        emit ItemDeactivated(itemId);
    }
    
    /**
     * @dev Purchase an item
     * @param itemId ID of the item to purchase
     * @param quantity Quantity to purchase
     */
    function purchaseItem(uint256 itemId, uint256 quantity) public nonReentrant {
        ShopItem storage item = items[itemId];
        
        require(item.id != 0, "Item does not exist");
        require(item.active, "Item is not active");
        require(quantity > 0, "Quantity must be greater than 0");
        require(item.quantity >= quantity, "Insufficient quantity available");
        
        uint256 totalPrice = item.price * quantity;
        uint256 feeAmount = (totalPrice * platformFee) / 10000;
        uint256 sellerAmount = totalPrice - feeAmount;
        
        // Transfer payment from buyer
        require(IERC20(item.tokenAddress).transferFrom(msg.sender, address(this), totalPrice), "Payment transfer failed");
        
        // Transfer fee to platform
        if (feeAmount > 0) {
            require(IERC20(item.tokenAddress).transfer(feeRecipient, feeAmount), "Fee transfer failed");
        }
        
        // Transfer remaining amount to owner
        require(IERC20(item.tokenAddress).transfer(owner(), sellerAmount), "Seller transfer failed");
        
        // Update item quantity
        if (item.maxQuantity != type(uint256).max) {
            item.quantity -= quantity;
        }
        
        // Record purchase
        purchaseCount++;
        purchases[purchaseCount] = PurchaseRecord({
            itemId: itemId,
            buyer: msg.sender,
            quantity: quantity,
            totalPrice: totalPrice,
            timestamp: block.timestamp
        });
        
        emit ItemPurchased(purchaseCount, itemId, msg.sender, quantity, totalPrice);
    }
    
    /**
     * @dev Get item information
     * @param itemId ID of the item
     * @return Item information
     */
    function getItem(uint256 itemId) public view returns (ShopItem memory) {
        return items[itemId];
    }
    
    /**
     * @dev Get items for a specific game
     * @param gameId ID of the game
     * @param limit Maximum number of items to return
     * @return Array of item IDs
     */
    function getItemsByGame(uint256 gameId, uint256 limit) public view returns (uint256[] memory) {
        uint256[] storage gameItemList = gameItems[gameId];
        uint256 actualLimit = limit < gameItemList.length ? limit : gameItemList.length;
        
        uint256[] memory result = new uint256[](actualLimit);
        uint256 count = 0;
        
        for (uint256 i = 0; i < gameItemList.length && count < actualLimit; i++) {
            uint256 itemId = gameItemList[i];
            if (items[itemId].active) {
                result[count] = itemId;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }
    
    /**
     * @dev Get purchase history for a buyer
     * @param buyer Address of the buyer
     * @param limit Maximum number of purchases to return
     * @return Array of purchase records
     */
    function getPurchaseHistory(address buyer, uint256 limit) public view returns (PurchaseRecord[] memory) {
        PurchaseRecord[] memory buyerPurchases = new PurchaseRecord[](purchaseCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= purchaseCount; i++) {
            if (purchases[i].buyer == buyer) {
                buyerPurchases[count] = purchases[i];
                count++;
            }
        }
        
        uint256 actualLimit = limit < count ? limit : count;
        PurchaseRecord[] memory result = new PurchaseRecord[](actualLimit);
        
        // Return the most recent purchases first
        for (uint256 i = 0; i < actualLimit; i++) {
            result[i] = buyerPurchases[count - 1 - i];
        }
        
        return result;
    }
    
    /**
     * @dev Get total number of items
     * @return Total item count
     */
    function getItemCount() public view returns (uint256) {
        return itemCount;
    }
    
    /**
     * @dev Get total number of purchases
     * @return Total purchase count
     */
    function getPurchaseCount() public view returns (uint256) {
        return purchaseCount;
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
}