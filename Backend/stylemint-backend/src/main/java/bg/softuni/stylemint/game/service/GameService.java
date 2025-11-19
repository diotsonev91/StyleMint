package bg.softuni.stylemint.game.service;

import bg.softuni.stylemint.game.dto.GameResultDTO;
import bg.softuni.stylemint.game.dto.GameSessionDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.model.GameSession;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing game sessions
 */
public interface GameService {

    /**
     * Record a new game session
     * @param userId Player ID
     * @param result Game result details
     * @return Created game session
     */
    GameSessionDTO recordGameSession(UUID userId, GameResultDTO result);

    /**
     * Get user's game summary for profile
     * Includes: total score, games played, game types, unclaimed rewards, last played
     * @param userId User ID
     * @return User's game statistics summary
     */
    UserGameSummaryDTO getUserGameSummary(UUID userId);

    /**
     * Get user's game history
     * @param userId User ID
     * @param limit Maximum number of sessions to return
     * @return List of game sessions
     */
    List<GameSessionDTO> getUserGameHistory(UUID userId, int limit);

    /**
     * Get user's game sessions by type
     * @param userId User ID
     * @param gameType Type of game
     * @return List of game sessions
     */
    List<GameSessionDTO> getUserGamesByType(UUID userId, GameType gameType);

    /**
     * Claim reward from a game session
     * @param sessionId Game session ID
     * @param userId User ID (for verification)
     * @return Updated game session
     */
    GameSessionDTO claimReward(UUID sessionId, UUID userId);

    /**
     * Get unclaimed rewards for user
     * @param userId User ID
     * @return List of sessions with unclaimed rewards
     */
    List<GameSessionDTO> getUnclaimedRewards(UUID userId);


}