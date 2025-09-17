// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GameAMM
 * @dev Automated Market Maker for in-game assets and NFTs on SomniaGames
 */
contract GameAMM is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Info of each liquidity pool
    struct PoolInfo {
        IERC20 tokenA;              // First token in pair
        IERC20 tokenB;              // Second token in pair
        uint256 reserveA;           // Reserve of token A
        uint256 reserveB;           // Reserve of token B
        uint256 totalSupply;        // Total LP tokens
        mapping(address => uint256) balances; // LP token balances
    }

    // Info of each NFT market
    struct NFTMarketInfo {
        IERC721 nftContract;        // NFT contract
        mapping(uint256 => uint256) prices; // NFT ID to price
        mapping(uint256 => address) owners; // NFT ID to owner
        mapping(uint256 => bool) forSale; // NFT ID to sale status
    }

    // LP token for liquidity providers
    struct LPToken {
        string name;
        string symbol;
        uint8 decimals;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
    }

    // Mapping from pool ID to pool info
    mapping(uint256 => PoolInfo) public pools;
    
    // Mapping from NFT contract address to market info
    mapping(address => NFTMarketInfo) public nftMarkets;
    
    // LP token info
    LPToken public lpToken;
    
    // Pool counter
    uint256 public poolCounter;
    
    // Treasury for fees
    address public treasury;
    
    // Trading fee (in basis points)
    uint256 public tradingFee = 30; // 0.3%
    
    // Events
    event PoolCreated(uint256 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(uint256 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 lpAmount);
    event LiquidityRemoved(uint256 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 lpAmount);
    event Swap(uint256 indexed poolId, address trader, address fromToken, address toToken, uint256 amountIn, uint256 amountOut);
    event NFTRListed(address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event NFTPurchased(address indexed nftContract, uint256 indexed tokenId, address buyer, uint256 price);
    event NFTPriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event TreasuryUpdated(address newTreasury);
    event TradingFeeUpdated(uint256 newFee);

    constructor(address _treasury) {
        treasury = _treasury;
        
        // Initialize LP token
        lpToken.name = "SomniaGames LP Token";
        lpToken.symbol = "SGLP";
        lpToken.decimals = 18;
    }

    // Create a new liquidity pool
    function createPool(address _tokenA, address _tokenB) public onlyOwner returns (uint256) {
        require(_tokenA != _tokenB, "Tokens must be different");
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token address");
        
        poolCounter++;
        PoolInfo storage pool = pools[poolCounter];
        pool.tokenA = IERC20(_tokenA);
        pool.tokenB = IERC20(_tokenB);
        
        emit PoolCreated(poolCounter, _tokenA, _tokenB);
        return poolCounter;
    }

    // Add liquidity to a pool
    function addLiquidity(
        uint256 _poolId,
        uint256 _amountA,
        uint256 _amountB
    ) public whenNotPaused nonReentrant {
        PoolInfo storage pool = pools[_poolId];
        require(address(pool.tokenA) != address(0), "Pool does not exist");
        
        // Transfer tokens from user
        pool.tokenA.safeTransferFrom(msg.sender, address(this), _amountA);
        pool.tokenB.safeTransferFrom(msg.sender, address(this), _amountB);
        
        // Calculate LP tokens to mint
        uint256 lpAmount;
        if (pool.totalSupply == 0) {
            // First liquidity provider
            lpAmount = sqrt(_amountA * _amountB) - 1000; // Minimum LP tokens
        } else {
            // Subsequent providers
            uint256 lpAmountA = _amountA * pool.totalSupply / pool.reserveA;
            uint256 lpAmountB = _amountB * pool.totalSupply / pool.reserveB;
            lpAmount = lpAmountA < lpAmountB ? lpAmountA : lpAmountB;
        }
        
        // Update reserves
        pool.reserveA += _amountA;
        pool.reserveB += _amountB;
        pool.totalSupply += lpAmount;
        pool.balances[msg.sender] += lpAmount;
        lpToken.balances[msg.sender] += lpAmount;
        
        emit LiquidityAdded(_poolId, msg.sender, _amountA, _amountB, lpAmount);
    }

    // Remove liquidity from a pool
    function removeLiquidity(
        uint256 _poolId,
        uint256 _lpAmount
    ) public whenNotPaused nonReentrant {
        PoolInfo storage pool = pools[_poolId];
        require(address(pool.tokenA) != address(0), "Pool does not exist");
        require(pool.balances[msg.sender] >= _lpAmount, "Insufficient LP balance");
        
        // Calculate amounts to return
        uint256 amountA = _lpAmount * pool.reserveA / pool.totalSupply;
        uint256 amountB = _lpAmount * pool.reserveB / pool.totalSupply;
        
        // Update reserves
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= _lpAmount;
        pool.balances[msg.sender] -= _lpAmount;
        lpToken.balances[msg.sender] -= _lpAmount;
        
        // Transfer tokens to user
        pool.tokenA.safeTransfer(msg.sender, amountA);
        pool.tokenB.safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(_poolId, msg.sender, amountA, amountB, _lpAmount);
    }

    // Swap tokens
    function swap(
        uint256 _poolId,
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) public whenNotPaused nonReentrant returns (uint256 amountOut) {
        PoolInfo storage pool = pools[_poolId];
        require(address(pool.tokenA) != address(0), "Pool does not exist");
        require(_fromToken == address(pool.tokenA) || _fromToken == address(pool.tokenB), "Invalid from token");
        require(_toToken == address(pool.tokenA) || _toToken == address(pool.tokenB), "Invalid to token");
        require(_fromToken != _toToken, "Tokens must be different");
        
        // Transfer input tokens from user
        IERC20(_fromToken).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Calculate output amount with fee
        uint256 fee = _amountIn * tradingFee / 10000;
        uint256 amountInWithFee = _amountIn - fee;
        
        // Transfer fee to treasury
        if (fee > 0) {
            IERC20(_fromToken).safeTransfer(treasury, fee);
        }
        
        // Calculate output amount using constant product formula
        uint256 reserveIn = _fromToken == address(pool.tokenA) ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = _toToken == address(pool.tokenA) ? pool.reserveA : pool.reserveB;
        
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        amountOut = numerator / denominator;
        
        // Update reserves
        if (_fromToken == address(pool.tokenA)) {
            pool.reserveA += _amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += _amountIn;
            pool.reserveA -= amountOut;
        }
        
        // Transfer output tokens to user
        IERC20(_toToken).safeTransfer(msg.sender, amountOut);
        
        emit Swap(_poolId, msg.sender, _fromToken, _toToken, _amountIn, amountOut);
    }

    // List an NFT for sale
    function listNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) public whenNotPaused {
        IERC721 nft = IERC721(_nftContract);
        
        // Check if user owns the NFT
        require(nft.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // Transfer NFT to contract
        nft.transferFrom(msg.sender, address(this), _tokenId);
        
        // Update market info
        NFTMarketInfo storage market = nftMarkets[_nftContract];
        market.nftContract = nft;
        market.prices[_tokenId] = _price;
        market.owners[_tokenId] = msg.sender;
        market.forSale[_tokenId] = true;
        
        emit NFTRListed(_nftContract, _tokenId, _price);
    }

    // Update NFT price
    function updateNFTPrice(
        address _nftContract,
        uint256 _tokenId,
        uint256 _newPrice
    ) public whenNotPaused {
        NFTMarketInfo storage market = nftMarkets[_nftContract];
        require(market.forSale[_tokenId], "NFT not for sale");
        require(market.owners[_tokenId] == msg.sender, "Not NFT owner");
        
        market.prices[_tokenId] = _newPrice;
        
        emit NFTPriceUpdated(_nftContract, _tokenId, _newPrice);
    }

    // Buy an NFT
    function buyNFT(
        address _nftContract,
        uint256 _tokenId
    ) public whenNotPaused nonReentrant {
        NFTMarketInfo storage market = nftMarkets[_nftContract];
        require(market.forSale[_tokenId], "NFT not for sale");
        require(market.owners[_tokenId] != msg.sender, "Cannot buy your own NFT");
        
        uint256 price = market.prices[_tokenId];
        address seller = market.owners[_tokenId];
        
        // Transfer payment from buyer
        IERC20(address(pools[1].tokenA)).safeTransferFrom(msg.sender, address(this), price);
        
        // Calculate fee and transfer to treasury
        uint256 fee = price * tradingFee / 10000;
        if (fee > 0) {
            IERC20(address(pools[1].tokenA)).safeTransfer(treasury, fee);
        }
        
        // Transfer remaining to seller
        IERC20(address(pools[1].tokenA)).safeTransfer(seller, price - fee);
        
        // Transfer NFT to buyer
        market.nftContract.transferFrom(address(this), msg.sender, _tokenId);
        
        // Update market info
        market.owners[_tokenId] = msg.sender;
        market.forSale[_tokenId] = false;
        
        emit NFTPurchased(_nftContract, _tokenId, msg.sender, price);
    }

    // Get LP token balance
    function getLPTokenBalance(address user) external view returns (uint256) {
        return lpToken.balances[user];
    }

    // Get pool reserves
    function getReserves(uint256 _poolId) external view returns (uint256 reserveA, uint256 reserveB) {
        PoolInfo storage pool = pools[_poolId];
        return (pool.reserveA, pool.reserveB);
    }

    // Get amount out for a swap
    function getAmountOut(
        uint256 _poolId,
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) external view returns (uint256 amountOut) {
        PoolInfo storage pool = pools[_poolId];
        if (address(pool.tokenA) == address(0)) return 0;
        if (_fromToken == _toToken) return 0;
        
        uint256 fee = _amountIn * tradingFee / 10000;
        uint256 amountInWithFee = _amountIn - fee;
        
        uint256 reserveIn = _fromToken == address(pool.tokenA) ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = _toToken == address(pool.tokenA) ? pool.reserveA : pool.reserveB;
        
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        amountOut = numerator / denominator;
    }

    // Get NFT price
    function getNFTPrice(address _nftContract, uint256 _tokenId) external view returns (uint256) {
        return nftMarkets[_nftContract].prices[_tokenId];
    }

    // Check if NFT is for sale
    function isNFTForSale(address _nftContract, uint256 _tokenId) external view returns (bool) {
        return nftMarkets[_nftContract].forSale[_tokenId];
    }

    // Update treasury address
    function updateTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // Update trading fee
    function updateTradingFee(uint256 _tradingFee) public onlyOwner {
        require(_tradingFee <= 1000, "Fee too high"); // Max 10%
        tradingFee = _tradingFee;
        emit TradingFeeUpdated(_tradingFee);
    }

    // Pause the contract
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause the contract
    function unpause() public onlyOwner {
        _unpause();
    }

    // Helper function for sqrt
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}