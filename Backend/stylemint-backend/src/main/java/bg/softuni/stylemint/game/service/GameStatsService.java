package bg.softuni.stylemint.game.service;

import bg.softuni.stylemint.game.dto.LeaderboardEntryDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;

import java.util.List;
import java.util.UUID;

/**
 * Service for game statistics and leaderboards
 */
public interface GameStatsService {

    /**
     * Get user's total game score (all games combined)
     */
    long getUserScore(UUID userId);

    /**
     * Get comprehensive game summary for a user
     * Includes: total score, games played, game types played, unclaimed rewards, last played
     */
    UserGameSummaryDTO getUserGameSummary(UUID userId);

    /**
     * Get overall leaderboard (top players across all games)
     */
    List<LeaderboardEntryDTO> getOverallLeaderboard(int limit);

    /**
     * Get leaderboard for a specific game type
     */
    List<LeaderboardEntryDTO> getLeaderboardByGameType(GameType gameType, int limit);

    /**
     * Get user's rank in overall leaderboard
     */
    int getUserOverallRank(UUID userId);

    /**
     * Get user's rank for a specific game type
     */
    int getUserRankForGameType(UUID userId, GameType gameType);
}