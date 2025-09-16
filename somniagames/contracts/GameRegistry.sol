// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GameRegistry
 * @dev Core contract for registering and managing games on the SomniaGames platform
 */
contract GameRegistry {
    // Structure to hold game information
    struct Game {
        uint256 id;
        string name;
        string description;
        string metadataURI;
        address creator;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        uint256 playerCount;
        uint256 version;
        address leaderboardAddress;
        address shopAddress;
    }

    // Mapping from game ID to Game struct
    mapping(uint256 => Game) public games;
    
    // Mapping from creator address to game IDs
    mapping(address => uint256[]) public creatorGames;
    
    // Mapping from game ID to player addresses
    mapping(uint256 => mapping(address => bool)) public gamePlayers;
    
    // Mapping from game ID to player count
    mapping(uint256 => address[]) public gamePlayerList;
    
    // Counter for game IDs
    uint256 public gameCount;
    
    // Events
    event GameCreated(uint256 indexed gameId, string name, address indexed creator);
    event GameActivated(uint256 indexed gameId);
    event GameDeactivated(uint256 indexed gameId);
    event GameUpdated(uint256 indexed gameId, string name, string description);
    event GameMetadataUpdated(uint256 indexed gameId, string metadataURI);
    event PlayerJoined(uint256 indexed gameId, address player);
    event PlayerLeft(uint256 indexed gameId, address player);
    event GameVersionUpdated(uint256 indexed gameId, uint256 version);
    event GameLeaderboardSet(uint256 indexed gameId, address leaderboardAddress);
    event GameShopSet(uint256 indexed gameId, address shopAddress);
    
    /**
     * @dev Create a new game
     * @param _name Name of the game
     * @param _description Description of the game
     * @param _metadataURI URI to game metadata
     */
    function createGame(string memory _name, string memory _description, string memory _metadataURI) public {
        gameCount++;
        
        games[gameCount] = Game({
            id: gameCount,
            name: _name,
            description: _description,
            metadataURI: _metadataURI,
            creator: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            playerCount: 0,
            version: 1,
            leaderboardAddress: address(0),
            shopAddress: address(0)
        });
        
        creatorGames[msg.sender].push(gameCount);
        
        emit GameCreated(gameCount, _name, msg.sender);
    }
    
    /**
     * @dev Update game information
     * @param _gameId ID of the game to update
     * @param _name New name of the game
     * @param _description New description of the game
     */
    function updateGame(uint256 _gameId, string memory _name, string memory _description) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        
        games[_gameId].name = _name;
        games[_gameId].description = _description;
        games[_gameId].updatedAt = block.timestamp;
        
        emit GameUpdated(_gameId, _name, _description);
    }
    
    /**
     * @dev Update game metadata URI
     * @param _gameId ID of the game to update
     * @param _metadataURI New URI to game metadata
     */
    function updateGameMetadata(uint256 _gameId, string memory _metadataURI) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        
        games[_gameId].metadataURI = _metadataURI;
        games[_gameId].updatedAt = block.timestamp;
        
        emit GameMetadataUpdated(_gameId, _metadataURI);
    }
    
    /**
     * @dev Activate a game
     * @param _gameId ID of the game to activate
     */
    function activateGame(uint256 _gameId) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        
        games[_gameId].isActive = true;
        games[_gameId].updatedAt = block.timestamp;
        
        emit GameActivated(_gameId);
    }
    
    /**
     * @dev Deactivate a game
     * @param _gameId ID of the game to deactivate
     */
    function deactivateGame(uint256 _gameId) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        
        games[_gameId].isActive = false;
        games[_gameId].updatedAt = block.timestamp;
        
        emit GameDeactivated(_gameId);
    }
    
    /**
     * @dev Update game version
     * @param _gameId ID of the game to update
     * @param _version New version number
     */
    function updateGameVersion(uint256 _gameId, uint256 _version) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        require(_version > games[_gameId].version, "New version must be higher than current version");
        
        games[_gameId].version = _version;
        games[_gameId].updatedAt = block.timestamp;
        
        emit GameVersionUpdated(_gameId, _version);
    }
    
    /**
     * @dev Set leaderboard contract address for a game
     * @param _gameId ID of the game
     * @param _leaderboardAddress Address of the leaderboard contract
     */
    function setGameLeaderboard(uint256 _gameId, address _leaderboardAddress) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        require(_leaderboardAddress != address(0), "Leaderboard address cannot be zero");
        
        games[_gameId].leaderboardAddress = _leaderboardAddress;
        
        emit GameLeaderboardSet(_gameId, _leaderboardAddress);
    }
    
    /**
     * @dev Set shop contract address for a game
     * @param _gameId ID of the game
     * @param _shopAddress Address of the shop contract
     */
    function setGameShop(uint256 _gameId, address _shopAddress) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        require(games[_gameId].id != 0, "Game does not exist");
        require(_shopAddress != address(0), "Shop address cannot be zero");
        
        games[_gameId].shopAddress = _shopAddress;
        
        emit GameShopSet(_gameId, _shopAddress);
    }
    
    /**
     * @dev Join a game as a player
     * @param _gameId ID of the game to join
     */
    function joinGame(uint256 _gameId) public {
        require(games[_gameId].id != 0, "Game does not exist");
        require(games[_gameId].isActive, "Game is not active");
        require(!gamePlayers[_gameId][msg.sender], "Player already joined");
        
        gamePlayers[_gameId][msg.sender] = true;
        gamePlayerList[_gameId].push(msg.sender);
        games[_gameId].playerCount++;
        
        emit PlayerJoined(_gameId, msg.sender);
    }
    
    /**
     * @dev Leave a game as a player
     * @param _gameId ID of the game to leave
     */
    function leaveGame(uint256 _gameId) public {
        require(games[_gameId].id != 0, "Game does not exist");
        require(gamePlayers[_gameId][msg.sender], "Player not in game");
        
        gamePlayers[_gameId][msg.sender] = false;
        games[_gameId].playerCount--;
        
        // Remove player from player list
        address[] storage players = gamePlayerList[_gameId];
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == msg.sender) {
                players[i] = players[players.length - 1];
                players.pop();
                break;
            }
        }
        
        emit PlayerLeft(_gameId, msg.sender);
    }
    
    /**
     * @dev Get all games created by a specific address
     * @param _creator Address of the game creator
     * @return Array of game IDs
     */
    function getGamesByCreator(address _creator) public view returns (uint256[] memory) {
        return creatorGames[_creator];
    }
    
    /**
     * @dev Get all players in a game
     * @param _gameId ID of the game
     * @return Array of player addresses
     */
    function getGamePlayers(uint256 _gameId) public view returns (address[] memory) {
        return gamePlayerList[_gameId];
    }
    
    /**
     * @dev Check if a player is in a game
     * @param _gameId ID of the game
     * @param _player Address of the player
     * @return True if player is in game, false otherwise
     */
    function isPlayerInGame(uint256 _gameId, address _player) public view returns (bool) {
        return gamePlayers[_gameId][_player];
    }
    
    /**
     * @dev Get active games (with pagination)
     * @param _offset Starting index
     * @param _limit Number of games to return
     * @return Array of active game IDs
     */
    function getActiveGames(uint256 _offset, uint256 _limit) public view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](_limit);
        uint256 count = 0;
        
        for (uint256 i = _offset + 1; i <= gameCount && count < _limit; i++) {
            if (games[i].isActive) {
                activeGames[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeGames[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get total active games count
     * @return Number of active games
     */
    function getActiveGamesCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= gameCount; i++) {
            if (games[i].isActive) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get game leaderboard address
     * @param _gameId ID of the game
     * @return Address of the leaderboard contract
     */
    function getGameLeaderboard(uint256 _gameId) public view returns (address) {
        require(games[_gameId].id != 0, "Game does not exist");
        return games[_gameId].leaderboardAddress;
    }
    
    /**
     * @dev Get game shop address
     * @param _gameId ID of the game
     * @return Address of the shop contract
     */
    function getGameShop(uint256 _gameId) public view returns (address) {
        require(games[_gameId].id != 0, "Game does not exist");
        return games[_gameId].shopAddress;
    }
}