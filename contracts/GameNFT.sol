// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct NFTMetadata {
        string name;
        string description;
        string image;
    }
    
    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    
    constructor() ERC721("GameNFT", "GNFT") {}
    
    function mintNFT(address recipient, string memory name, string memory description, string memory image) 
        public onlyOwner returns (uint256) {
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        
        _tokenMetadata[newItemId] = NFTMetadata(name, description, image);
        
        return newItemId;
    }
    
    function getTokenMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        return _tokenMetadata[tokenId];
    }
    
    function transferNFT(address from, address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == from, "Sender does not own this NFT");
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not authorized to transfer");
        _transfer(from, to, tokenId);
    }
}