// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleGameRegistry
 * @dev Core contract for registering and managing games on the SomniaGames platform
 */
contract SimpleGameRegistry {
    // Structure to hold game information
    struct Game {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool isActive;
    }

    // Mapping from game ID to Game struct
    mapping(uint256 => Game) public games;
    
    // Mapping from creator address to game IDs
    mapping(address => uint256[]) public creatorGames;
    
    // Counter for game IDs
    uint256 public gameCount;
    
    // Events
    event GameCreated(uint256 indexed gameId, string name, address indexed creator);
    event GameActivated(uint256 indexed gameId);
    event GameDeactivated(uint256 indexed gameId);
    
    /**
     * @dev Create a new game
     * @param _name Name of the game
     * @param _description Description of the game
     */
    function createGame(string memory _name, string memory _description) public {
        gameCount++;
        
        games[gameCount] = Game({
            id: gameCount,
            name: _name,
            description: _description,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true
        });
        
        creatorGames[msg.sender].push(gameCount);
        
        emit GameCreated(gameCount, _name, msg.sender);
    }
    
    /**
     * @dev Activate a game
     * @param _gameId ID of the game to activate
     */
    function activateGame(uint256 _gameId) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        games[_gameId].isActive = true;
        emit GameActivated(_gameId);
    }
    
    /**
     * @dev Deactivate a game
     * @param _gameId ID of the game to deactivate
     */
    function deactivateGame(uint256 _gameId) public {
        require(games[_gameId].creator == msg.sender, "Only creator can modify game");
        games[_gameId].isActive = false;
        emit GameDeactivated(_gameId);
    }
    
    /**
     * @dev Get all games created by a specific address
     * @param _creator Address of the game creator
     * @return Array of game IDs
     */
    function getGamesByCreator(address _creator) public view returns (uint256[] memory) {
        return creatorGames[_creator];
    }
}