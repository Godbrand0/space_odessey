// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SpaceInvadersGame
 * @dev A play-to-earn Space Invaders game on Celo where players earn 2 CELO per level completed
 * @notice Players can play without staking and earn rewards for completing levels
 */
contract SpaceInvadersGame is Ownable, ReentrancyGuard, Pausable {
    // State variables
    uint256 private _gameSessionIds;
    
    // Constants
    uint256 public constant REWARD_PER_LEVEL = 2 ether; // 2 CELO per level
    uint256 public constant MAX_LEVELS = 5;
    uint256 public constant LEVEL_DURATION = 60 seconds; // 60 seconds per level
    uint256 public constant ALIENS_PER_ROW = 11;
    
    // Game session structure
    struct GameSession {
        uint256 sessionId;
        address player;
        uint256 currentLevel;
        uint256 levelsCompleted;
        uint256 totalRewardsEarned;
        uint256 startTime;
        uint256 levelStartTime;
        bool isActive;
        bool isCompleted;
        uint256[] levelHashes; // Hashes of level completion proofs
    }
    
    // Mappings
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => uint256[]) public playerSessions;
    mapping(address => uint256) public playerTotalRewards;
    mapping(uint256 => bool) public levelHashUsed; // Prevent replay attacks
    
    // Events
    event GameStarted(uint256 indexed sessionId, address indexed player, uint256 startTime);
    event LevelCompleted(uint256 indexed sessionId, address indexed player, uint256 level, bytes32 levelHash);
    event GameCompleted(uint256 indexed sessionId, address indexed player, uint256 totalRewards);
    event RewardsClaimed(uint256 indexed sessionId, address indexed player, uint256 amount);
    event GameAbandoned(uint256 indexed sessionId, address indexed player, uint256 levelsCompleted, uint256 partialRewards);
    event OwnerWithdraw(address indexed owner, uint256 amount);
    event ContractFunded(address indexed funder, uint256 amount);
    
    // Errors
    error NoActiveSession();
    error SessionNotActive();
    error InvalidLevel();
    error LevelAlreadyCompleted();
    error LevelTimeExpired();
    error InvalidLevelHash();
    error LevelHashAlreadyUsed();
    error NoRewardsToClaim();
    error InsufficientContractBalance();
    error TransferFailed();
    error InvalidSession();
    
    // Modifiers
    modifier onlyValidSession(uint256 sessionId) {
        if (sessionId == 0 || gameSessions[sessionId].player == address(0)) {
            revert InvalidSession();
        }
        _;
    }
    
    modifier onlySessionOwner(uint256 sessionId) {
        if (gameSessions[sessionId].player != msg.sender) {
            revert NoActiveSession();
        }
        _;
    }
    
    modifier onlyActiveSession(uint256 sessionId) {
        if (!gameSessions[sessionId].isActive) {
            revert SessionNotActive();
        }
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Constructor intentionally left empty - contract receives native CELO
    }
    
    /**
     * @dev Starts a new game session for the player
     * @return sessionId The ID of the newly created game session
     */
    function startGame() external whenNotPaused returns (uint256 sessionId) {
        _gameSessionIds++;
        sessionId = _gameSessionIds;
        
        GameSession storage session = gameSessions[sessionId];
        session.sessionId = sessionId;
        session.player = msg.sender;
        session.currentLevel = 1;
        session.levelsCompleted = 0;
        session.totalRewardsEarned = 0;
        session.startTime = block.timestamp;
        session.levelStartTime = block.timestamp;
        session.isActive = true;
        session.isCompleted = false;
        
        playerSessions[msg.sender].push(sessionId);
        
        emit GameStarted(sessionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Completes a level and awards rewards
     * @param sessionId The ID of the game session
     * @param level The level being completed (1-5)
     * @param score The score achieved in the level
     * @param aliensDestroyed Number of aliens destroyed
     * @param proof Merkle proof or other verification data
     */
    function completeLevel(
        uint256 sessionId,
        uint256 level,
        uint256 score,
        uint256 aliensDestroyed,
        bytes calldata proof
    ) external 
        nonReentrant 
        whenNotPaused 
        onlyValidSession(sessionId)
        onlySessionOwner(sessionId)
        onlyActiveSession(sessionId)
    {
        GameSession storage session = gameSessions[sessionId];
        
        // Validate level
        if (level != session.currentLevel || level > MAX_LEVELS) {
            revert InvalidLevel();
        }
        
        // Check if level time hasn't expired
        if (block.timestamp > session.levelStartTime + LEVEL_DURATION) {
            revert LevelTimeExpired();
        }
        
        // Verify level completion (simplified verification - in production, this would be more sophisticated)
        uint256 expectedAliens = getAlienCountForLevel(level);
        if (aliensDestroyed != expectedAliens) {
            revert InvalidLevelHash();
        }
        
        // Create level hash to prevent replay attacks
        bytes32 levelHash = keccak256(abi.encodePacked(sessionId, level, score, aliensDestroyed, block.timestamp));
        
        if (levelHashUsed[uint256(levelHash)]) {
            revert LevelHashAlreadyUsed();
        }
        
        levelHashUsed[uint256(levelHash)] = true;
        session.levelHashes.push(uint256(levelHash));
        
        // Update session state
        session.levelsCompleted++;
        session.totalRewardsEarned += REWARD_PER_LEVEL;
        session.currentLevel++;
        session.levelStartTime = block.timestamp;
        
        // Check if game is completed
        if (session.currentLevel > MAX_LEVELS) {
            session.isActive = false;
            session.isCompleted = true;
            playerTotalRewards[msg.sender] += session.totalRewardsEarned;
            emit GameCompleted(sessionId, msg.sender, session.totalRewardsEarned);
        }
        
        emit LevelCompleted(sessionId, msg.sender, level, levelHash);
    }
    
    /**
     * @dev Abandons the current game session (called when player quits or loses)
     * @notice Player receives partial rewards for any completed levels before quitting/losing
     * @param sessionId The ID of the game session to abandon
     */
    function abandonGame(uint256 sessionId)
        external
        nonReentrant
        whenNotPaused
        onlyValidSession(sessionId)
        onlySessionOwner(sessionId)
        onlyActiveSession(sessionId)
    {
        GameSession storage session = gameSessions[sessionId];
        session.isActive = false;

        uint256 partialRewards = session.totalRewardsEarned;

        // Player keeps rewards for any levels they completed before losing/quitting
        if (partialRewards > 0) {
            playerTotalRewards[msg.sender] += partialRewards;
        }

        emit GameAbandoned(sessionId, msg.sender, session.levelsCompleted, partialRewards);
    }
    
    /**
     * @dev Claims rewards earned from completed levels
     * @param sessionId The ID of the game session
     */
    function claimRewards(uint256 sessionId)
        external
        nonReentrant
        whenNotPaused
        onlyValidSession(sessionId)
        onlySessionOwner(sessionId)
    {
        // Check if session is still active - rewards can only be claimed when game is over
        GameSession storage session = gameSessions[sessionId];
        if (session.isActive) {
            revert SessionNotActive();
        }

        if (session.levelsCompleted == 0) {
            revert NoRewardsToClaim();
        }

        uint256 rewardsToClaim = session.totalRewardsEarned;

        // Check contract has sufficient balance
        if (address(this).balance < rewardsToClaim) {
            revert InsufficientContractBalance();
        }

        // Reset rewards to prevent double claiming
        session.totalRewardsEarned = 0;

        // Transfer native CELO to player
        (bool success, ) = payable(msg.sender).call{value: rewardsToClaim}("");
        if (!success) {
            revert TransferFailed();
        }

        emit RewardsClaimed(sessionId, msg.sender, rewardsToClaim);
    }
    
    /**
     * @dev Gets the number of aliens for a specific level
     * @param level The level number (1-5)
     * @return The number of aliens in that level
     */
    function getAlienCountForLevel(uint256 level) public pure returns (uint256) {
        if (level < 1 || level > MAX_LEVELS) {
            return 0;
        }
        return level * ALIENS_PER_ROW;
    }
    
    /**
     * @dev Gets game session information
     * @param sessionId The ID of the game session
     * @return player The player address
     * @return currentLevel The current level
     * @return levelsCompleted The number of levels completed
     * @return totalRewardsEarned Total rewards earned so far
     * @return startTime The session start time
     * @return isActive Whether the session is active
     * @return isCompleted Whether the game is completed
     */
    function getSessionInfo(uint256 sessionId) 
        external 
        view 
        onlyValidSession(sessionId)
        returns (
            address player,
            uint256 currentLevel,
            uint256 levelsCompleted,
            uint256 totalRewardsEarned,
            uint256 startTime,
            bool isActive,
            bool isCompleted
        ) 
    {
        GameSession storage session = gameSessions[sessionId];
        return (
            session.player,
            session.currentLevel,
            session.levelsCompleted,
            session.totalRewardsEarned,
            session.startTime,
            session.isActive,
            session.isCompleted
        );
    }
    
    /**
     * @dev Gets all session IDs for a player
     * @param player The player address
     * @return An array of session IDs
     */
    function getPlayerSessions(address player) external view returns (uint256[] memory) {
        return playerSessions[player];
    }
    
    /**
     * @dev Gets the remaining time for the current level
     * @param sessionId The ID of the game session
     * @return The remaining time in seconds, 0 if expired
     */
    function getLevelTimeRemaining(uint256 sessionId) 
        external 
        view 
        onlyValidSession(sessionId)
        returns (uint256) 
    {
        GameSession storage session = gameSessions[sessionId];
        if (!session.isActive) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - session.levelStartTime;
        if (timeElapsed >= LEVEL_DURATION) {
            return 0;
        }
        
        return LEVEL_DURATION - timeElapsed;
    }
    
    /**
     * @dev Pauses the contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Allows the contract owner to withdraw CELO from the contract
     * @notice Only the deployer can call this function
     * @param amount The amount of CELO to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        if (address(this).balance < amount) {
            revert InsufficientContractBalance();
        }

        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit OwnerWithdraw(owner(), amount);
    }

    /**
     * @dev Allows the owner to fund the reward pool with native CELO
     * @notice This is how the deployer funds the contract for player rewards
     */
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send CELO");
        emit ContractFunded(msg.sender, msg.value);
    }

    /**
     * @dev Fallback to receive native CELO (anyone can fund the contract)
     */
    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }

    /**
     * @dev Gets the contract's native CELO balance
     * @return The balance of native CELO in the contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Gets the total rewards earned by a player across all sessions
     * @param player The player address
     * @return The total rewards earned
     */
    function getPlayerTotalRewards(address player) external view returns (uint256) {
        return playerTotalRewards[player];
    }
}



