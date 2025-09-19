// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GameContract is Ownable {
    struct GameState {
        uint256 level;
        uint256 score;
        bool isActive;
        address[] players;
    }
    
    GameState public gameState;
    
    mapping(address => bool) public isPlayer;
    mapping(address => uint256) public playerScores;
    
    event GameStarted();
    event PlayerJoined(address player);
    event MoveMade(address player, string move);
    event GameEnded(address winner);
    
    constructor(uint256 initialLevel) {
        gameState.level = initialLevel;
        gameState.score = 0;
        gameState.isActive = false;
    }
    
    function startGame(address[] memory players) public onlyOwner {
        require(!gameState.isActive, "Game is already active");
        
        gameState.players = players;
        gameState.isActive = true;
        
        for (uint i = 0; i < players.length; i++) {
            isPlayer[players[i]] = true;
        }
        
        emit GameStarted();
    }
    
    function joinGame() public {
        require(gameState.isActive, "Game is not active");
        require(!isPlayer[msg.sender], "Player already joined");
        
        gameState.players.push(msg.sender);
        isPlayer[msg.sender] = true;
        
        emit PlayerJoined(msg.sender);
    }
    
    function makeMove(string memory move) public {
        require(gameState.isActive, "Game is not active");
        require(isPlayer[msg.sender], "Not a player in this game");
        
        // Update score based on move (simplified logic)
        playerScores[msg.sender] += 10;
        
        emit MoveMade(msg.sender, move);
    }
    
    function endGame(address winner) public onlyOwner {
        require(gameState.isActive, "Game is not active");
        
        gameState.isActive = false;
        
        emit GameEnded(winner);
    }
    
    function getPlayers() public view returns (address[] memory) {
        return gameState.players;
    }
}