package bg.softuni.stylemint.game.service;

import bg.softuni.stylemint.game.dto.*;
import bg.softuni.stylemint.game.enums.GameType;

import java.util.List;
import java.util.UUID;

public interface GameService {

    // Game Session Methods
    GameSessionDTO recordGameSession(UUID userId, GameResultDTO result);
    List<GameSessionDTO> getUserGameHistory(UUID userId, int limit);
    List<GameSessionDTO> getUserGamesByType(UUID userId, GameType gameType);
    GameSessionDTO claimReward(UUID sessionId, UUID userId);
    List<GameSessionDTO> getUnclaimedRewards(UUID userId);

    // Statistics Methods
    UserGameSummaryDTO getUserGameSummary(UUID userId);
    long getUserScore(UUID userId);

    // Leaderboard Methods
    List<LeaderboardEntryDTO> getOverallLeaderboard(int limit);
    List<LeaderboardEntryDTO> getLeaderboardByGameType(GameType gameType, int limit);
    int getUserOverallRank(UUID userId);
    int getUserRankForGameType(UUID userId, GameType gameType);
}