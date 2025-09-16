// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GameAsset
 * @dev ERC721 token for game assets in SomniaGames
 */
contract GameAsset is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Structure to hold asset metadata
    struct Asset {
        string name;
        string description;
        string metadataURI;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 gameId;
        uint256 rarity;
        uint256 level;
    }
    
    // Mapping from token ID to asset data
    mapping(uint256 => Asset) public assets;
    
    // Mapping from game ID to asset IDs
    mapping(uint256 => uint256[]) public gameAssets;
    
    // Mapping from owner to asset IDs
    mapping(address => uint256[]) public ownerAssets;
    
    // Events
    event AssetCreated(uint256 indexed assetId, string name, address owner, uint256 gameId);
    event AssetUpdated(uint256 indexed assetId, string name, string description);
    event AssetLevelUp(uint256 indexed assetId, uint256 newLevel);
    event AssetTransferred(uint256 indexed assetId, address from, address to);
    
    constructor() ERC721("SomniaGameAsset", "SGA") {}
    
    /**
     * @dev Create a new game asset
     * @param owner Address that will own the asset
     * @param name Name of the asset
     * @param description Description of the asset
     * @param metadataURI URI to asset metadata
     * @param gameId ID of the game this asset belongs to
     * @param rarity Rarity level of the asset (1-5)
     * @return ID of the newly created asset
     */
    function createAsset(
        address owner,
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 gameId,
        uint256 rarity
    ) public onlyOwner returns (uint256) {
        require(rarity >= 1 && rarity <= 5, "Rarity must be between 1 and 5");
        require(owner != address(0), "Owner cannot be zero address");
        
        _tokenIds.increment();
        uint256 newAssetId = _tokenIds.current();
        
        _mint(owner, newAssetId);
        
        assets[newAssetId] = Asset({
            name: name,
            description: description,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            gameId: gameId,
            rarity: rarity,
            level: 1
        });
        
        gameAssets[gameId].push(newAssetId);
        ownerAssets[owner].push(newAssetId);
        
        emit AssetCreated(newAssetId, name, owner, gameId);
        
        return newAssetId;
    }
    
    /**
     * @dev Update asset information
     * @param assetId ID of the asset to update
     * @param name New name of the asset
     * @param description New description of the asset
     */
    function updateAsset(uint256 assetId, string memory name, string memory description) public {
        require(_exists(assetId), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender || msg.sender == owner(), "Not authorized");
        
        assets[assetId].name = name;
        assets[assetId].description = description;
        assets[assetId].updatedAt = block.timestamp;
        
        emit AssetUpdated(assetId, name, description);
    }
    
    /**
     * @dev Update asset metadata URI
     * @param assetId ID of the asset to update
     * @param metadataURI New URI to asset metadata
     */
    function updateAssetMetadata(uint256 assetId, string memory metadataURI) public {
        require(_exists(assetId), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender || msg.sender == owner(), "Not authorized");
        
        assets[assetId].metadataURI = metadataURI;
        assets[assetId].updatedAt = block.timestamp;
    }
    
    /**
     * @dev Level up an asset
     * @param assetId ID of the asset to level up
     */
    function levelUpAsset(uint256 assetId) public {
        require(_exists(assetId), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(assets[assetId].level < 100, "Asset is already at max level");
        
        assets[assetId].level++;
        assets[assetId].updatedAt = block.timestamp;
        
        emit AssetLevelUp(assetId, assets[assetId].level);
    }
    
    /**
     * @dev Get asset metadata
     * @param assetId ID of the asset
     * @return Asset struct
     */
    function getAsset(uint256 assetId) public view returns (Asset memory) {
        return assets[assetId];
    }
    
    /**
     * @dev Get all assets for a specific game
     * @param gameId ID of the game
     * @return Array of asset IDs
     */
    function getAssetsByGame(uint256 gameId) public view returns (uint256[] memory) {
        return gameAssets[gameId];
    }
    
    /**
     * @dev Get all assets owned by a specific address
     * @param owner Address of the owner
     * @return Array of asset IDs
     */
    function getAssetsByOwner(address owner) public view returns (uint256[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Get total supply of assets
     * @return Total number of assets
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Get token URI for metadata
     * @param tokenId ID of the token
     * @return URI to token metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Asset does not exist");
        return assets[tokenId].metadataURI;
    }
    
    // Override required functions for ERC721Enumerable
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update ownerAssets mapping when transferring
        if (from != address(0)) {
            // Remove from previous owner's list
            uint256[] storage fromAssets = ownerAssets[from];
            for (uint256 i = 0; i < fromAssets.length; i++) {
                if (fromAssets[i] == tokenId) {
                    fromAssets[i] = fromAssets[fromAssets.length - 1];
                    fromAssets.pop();
                    break;
                }
            }
        }
        
        if (to != address(0)) {
            // Add to new owner's list
            ownerAssets[to].push(tokenId);
        }
        
        if (from != address(0) && to != address(0)) {
            emit AssetTransferred(tokenId, from, to);
        }
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}