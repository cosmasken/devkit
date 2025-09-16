// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameLeaderboard
 * @dev Leaderboard system for tracking player scores and rankings
 */
contract GameLeaderboard is Ownable {
    // Structure to hold player score
    struct PlayerScore {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    // Structure to hold leaderboard info
    struct Leaderboard {
        string name;
        string description;
        uint256 gameId;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Mapping from leaderboard ID to leaderboard info
    mapping(uint256 => Leaderboard) public leaderboards;
    
    // Mapping from leaderboard ID to player scores (sorted array)
    mapping(uint256 => PlayerScore[]) public leaderboardScores;
    
    // Mapping from leaderboard ID to player address to score index
    mapping(uint256 => mapping(address => uint256)) public playerScoreIndex;
    
    // Mapping from leaderboard ID to player address to whether they have a score
    mapping(uint256 => mapping(address => bool)) public hasScore;
    
    // Counter for leaderboard IDs
    uint256 public leaderboardCount;
    
    // Events
    event LeaderboardCreated(uint256 indexed leaderboardId, string name, uint256 gameId);
    event ScoreSubmitted(uint256 indexed leaderboardId, address player, uint256 score);
    event LeaderboardUpdated(uint256 indexed leaderboardId, string name, string description);
    event LeaderboardActivated(uint256 indexed leaderboardId);
    event LeaderboardDeactivated(uint256 indexed leaderboardId);
    
    /**
     * @dev Create a new leaderboard
     * @param name Name of the leaderboard
     * @param description Description of the leaderboard
     * @param gameId ID of the game this leaderboard belongs to
     */
    function createLeaderboard(string memory name, string memory description, uint256 gameId) public onlyOwner {
        leaderboardCount++;
        
        leaderboards[leaderboardCount] = Leaderboard({
            name: name,
            description: description,
            gameId: gameId,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        emit LeaderboardCreated(leaderboardCount, name, gameId);
    }
    
    /**
     * @dev Submit a score to a leaderboard
     * @param leaderboardId ID of the leaderboard
     * @param score Score to submit
     */
    function submitScore(uint256 leaderboardId, uint256 score) public {
        require(leaderboards[leaderboardId].active, "Leaderboard is not active");
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        
        // For simplicity, we'll just store the highest score per player
        // In a real implementation, you might want more complex logic
        if (hasScore[leaderboardId][msg.sender]) {
            // Player already has a score, update if new score is higher
            uint256 currentIndex = playerScoreIndex[leaderboardId][msg.sender];
            if (leaderboardScores[leaderboardId][currentIndex].score < score) {
                leaderboardScores[leaderboardId][currentIndex].score = score;
                leaderboardScores[leaderboardId][currentIndex].timestamp = block.timestamp;
            }
        } else {
            // New player, add to leaderboard
            PlayerScore memory newScore = PlayerScore({
                player: msg.sender,
                score: score,
                timestamp: block.timestamp
            });
            
            leaderboardScores[leaderboardId].push(newScore);
            playerScoreIndex[leaderboardId][msg.sender] = leaderboardScores[leaderboardId].length - 1;
            hasScore[leaderboardId][msg.sender] = true;
        }
        
        emit ScoreSubmitted(leaderboardId, msg.sender, score);
    }
    
    /**
     * @dev Update leaderboard information
     * @param leaderboardId ID of the leaderboard
     * @param name New name of the leaderboard
     * @param description New description of the leaderboard
     */
    function updateLeaderboard(uint256 leaderboardId, string memory name, string memory description) public onlyOwner {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        
        leaderboards[leaderboardId].name = name;
        leaderboards[leaderboardId].description = description;
        leaderboards[leaderboardId].updatedAt = block.timestamp;
        
        emit LeaderboardUpdated(leaderboardId, name, description);
    }
    
    /**
     * @dev Activate a leaderboard
     * @param leaderboardId ID of the leaderboard to activate
     */
    function activateLeaderboard(uint256 leaderboardId) public onlyOwner {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        
        leaderboards[leaderboardId].active = true;
        leaderboards[leaderboardId].updatedAt = block.timestamp;
        
        emit LeaderboardActivated(leaderboardId);
    }
    
    /**
     * @dev Deactivate a leaderboard
     * @param leaderboardId ID of the leaderboard to deactivate
     */
    function deactivateLeaderboard(uint256 leaderboardId) public onlyOwner {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        
        leaderboards[leaderboardId].active = false;
        leaderboards[leaderboardId].updatedAt = block.timestamp;
        
        emit LeaderboardDeactivated(leaderboardId);
    }
    
    /**
     * @dev Get leaderboard information
     * @param leaderboardId ID of the leaderboard
     * @return Leaderboard information
     */
    function getLeaderboard(uint256 leaderboardId) public view returns (Leaderboard memory) {
        return leaderboards[leaderboardId];
    }
    
    /**
     * @dev Get top scores from a leaderboard
     * @param leaderboardId ID of the leaderboard
     * @param count Number of top scores to return (max 100)
     * @return Array of top player scores
     */
    function getTopScores(uint256 leaderboardId, uint256 count) public view returns (PlayerScore[] memory) {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        require(count <= 100, "Count must be <= 100");
        
        PlayerScore[] storage scores = leaderboardScores[leaderboardId];
        uint256 actualCount = count < scores.length ? count : scores.length;
        
        PlayerScore[] memory topScores = new PlayerScore[](actualCount);
        
        // Simple bubble sort for demonstration (in production, use more efficient sorting)
        for (uint256 i = 0; i < actualCount; i++) {
            topScores[i] = scores[i];
        }
        
        // Sort by score (descending)
        for (uint256 i = 0; i < actualCount - 1; i++) {
            for (uint256 j = 0; j < actualCount - i - 1; j++) {
                if (topScores[j].score < topScores[j + 1].score) {
                    PlayerScore memory temp = topScores[j];
                    topScores[j] = topScores[j + 1];
                    topScores[j + 1] = temp;
                }
            }
        }
        
        return topScores;
    }
    
    /**
     * @dev Get player rank in a leaderboard
     * @param leaderboardId ID of the leaderboard
     * @param player Address of the player
     * @return Player's rank (0 if not found)
     */
    function getPlayerRank(uint256 leaderboardId, address player) public view returns (uint256) {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        require(hasScore[leaderboardId][player], "Player has no score in this leaderboard");
        
        PlayerScore[] memory topScores = getTopScores(leaderboardId, leaderboardScores[leaderboardId].length);
        
        for (uint256 i = 0; i < topScores.length; i++) {
            if (topScores[i].player == player) {
                return i + 1; // 1-indexed ranking
            }
        }
        
        return 0; // Should not happen if hasScore is true
    }
    
    /**
     * @dev Get player score in a leaderboard
     * @param leaderboardId ID of the leaderboard
     * @param player Address of the player
     * @return Player's score
     */
    function getPlayerScore(uint256 leaderboardId, address player) public view returns (uint256) {
        require(leaderboards[leaderboardId].createdAt != 0, "Leaderboard does not exist");
        require(hasScore[leaderboardId][player], "Player has no score in this leaderboard");
        
        uint256 index = playerScoreIndex[leaderboardId][player];
        return leaderboardScores[leaderboardId][index].score;
    }
    
    /**
     * @dev Get total number of leaderboards
     * @return Total leaderboard count
     */
    function getLeaderboardCount() public view returns (uint256) {
        return leaderboardCount;
    }
    
    /**
     * @dev Get leaderboards for a specific game
     * @param gameId ID of the game
     * @return Array of leaderboard IDs
     */
    function getLeaderboardsByGame(uint256 gameId) public view returns (uint256[] memory) {
        uint256[] memory gameLeaderboards = new uint256[](leaderboardCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= leaderboardCount; i++) {
            if (leaderboards[i].gameId == gameId) {
                gameLeaderboards[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = gameLeaderboards[i];
        }
        
        return result;
    }
}