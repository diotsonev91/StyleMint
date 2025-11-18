package bg.softuni.stylemint.game.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.game.dto.GameResultDTO;
import bg.softuni.stylemint.game.dto.GameSessionDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.model.GameSession;
import bg.softuni.stylemint.game.model.GameStats;
import bg.softuni.stylemint.game.model.Leaderboard;
import bg.softuni.stylemint.game.repository.GameSessionRepository;
import bg.softuni.stylemint.game.repository.GameStatsRepository;
import bg.softuni.stylemint.game.repository.LeaderboardRepository;
import bg.softuni.stylemint.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GameServiceImpl implements GameService {

    private final GameSessionRepository gameSessionRepository;
    private final GameStatsRepository gameStatsRepository;
    private final LeaderboardRepository leaderboardRepository;

    @Override
    public GameSessionDTO recordGameSession(UUID userId, GameResultDTO result) {
        // Create new game session
        GameSession session = GameSession.builder()
                .userId(userId)
                .gameType(result.getGameType())
                .score(result.getScore())
                .durationSeconds(result.getDurationSeconds())
                .rewardType(result.getRewardType())
                .rewardClaimed(false)
                .build();

        GameSession savedSession = gameSessionRepository.save(session);

        // Update aggregate GameStats
        updateGameStats(userId, result);

        // Update leaderboards
        updateLeaderboard(userId, result);

        return toDTO(savedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public UserGameSummaryDTO getUserGameSummary(UUID userId) {
        // Get total games played
        long gamesPlayed = gameSessionRepository.countByUserId(userId);

        if (gamesPlayed == 0) {
            // User has never played
            return UserGameSummaryDTO.builder()
                    .totalScore(0)
                    .gamesPlayed(0)
                    .gameTypes(Collections.emptySet())
                    .unclaimedRewards(0)
                    .lastPlayedAt(null)
                    .lastRewardType(null)
                    .build();
        }

        // Get total score (sum of all game sessions)
        long totalScore = gameSessionRepository.getTotalScoreByUserId(userId);

        // Get all game types user has played
        Set<GameType> gameTypes = leaderboardRepository.findGameTypesByUserId(userId)
                .stream()
                .collect(Collectors.toSet());

        // Count unclaimed rewards
        long unclaimedRewards = gameSessionRepository.countByUserIdAndRewardClaimedFalse(userId);

        // Get the most recent game session to find last played time and reward
        List<GameSession> recentSessions = gameSessionRepository.findByUserIdOrderByPlayedAtDesc(
                userId,
                PageRequest.of(0, 1)
        );

        GameSession lastSession = recentSessions.isEmpty() ? null : recentSessions.get(0);

        return UserGameSummaryDTO.builder()
                .totalScore((int) totalScore)
                .gamesPlayed((int) gamesPlayed)
                .gameTypes(gameTypes)
                .unclaimedRewards((int) unclaimedRewards)
                .lastPlayedAt(lastSession != null ? lastSession.getPlayedAt() : null)
                .lastRewardType(lastSession != null ? lastSession.getRewardType() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUserGameHistory(UUID userId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        return gameSessionRepository.findByUserIdOrderByPlayedAtDesc(userId, pageRequest)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUserGamesByType(UUID userId, GameType gameType) {
        return gameSessionRepository.findByUserIdAndGameType(userId, gameType)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GameSessionDTO claimReward(UUID sessionId, UUID userId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Game session not found"));

        // Verify ownership
        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("You don't have permission to claim this reward");
        }

        // Check if reward exists and is not already claimed
        if (session.getRewardType() == null) {
            throw new ForbiddenOperationException("This session has no reward");
        }

        if (Boolean.TRUE.equals(session.getRewardClaimed())) {
            throw new ForbiddenOperationException("Reward already claimed");
        }

        // Mark as claimed
        session.setRewardClaimed(true);
        GameSession updated = gameSessionRepository.save(session);

        // Update GameStats aggregate
        updateGameStatsRewardClaimed(userId);

        return toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUnclaimedRewards(UUID userId) {
        return gameSessionRepository.findByUserIdAndRewardClaimedFalse(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update or create GameStats aggregate record
     */
    private void updateGameStats(UUID userId, GameResultDTO result) {
        GameStats stats = gameStatsRepository.findByUserId(userId)
                .orElseGet(() -> createNewGameStats(userId));

        // Update aggregated values
        stats.setScore(stats.getScore() + result.getScore());
        stats.setGamesPlayed(stats.getGamesPlayed() + 1);
        stats.setLastPlayedAt(OffsetDateTime.now());

        // Update current reward (latest one)
        if (result.getRewardType() != null) {
            stats.setRewardType(result.getRewardType());
            stats.setRewardClaimed(false);
        }

        gameStatsRepository.save(stats);
    }

    /**
     * Update leaderboard entries for this game
     */
    private void updateLeaderboard(UUID userId, GameResultDTO result) {
        // Update leaderboard for specific game type
        if (result.getGameType() != null) {
            Leaderboard gameTypeLeaderboard = leaderboardRepository
                    .findByUserIdAndGameType(userId, result.getGameType())
                    .orElseGet(() -> createNewLeaderboardEntry(userId, result.getGameType()));

            gameTypeLeaderboard.setTotalScore(gameTypeLeaderboard.getTotalScore() + result.getScore());
            gameTypeLeaderboard.setGamesPlayed(gameTypeLeaderboard.getGamesPlayed() + 1);
            leaderboardRepository.save(gameTypeLeaderboard);
        }

        // Update overall leaderboard (gameType = null)
        Leaderboard overallLeaderboard = leaderboardRepository
                .findByUserIdAndGameTypeIsNull(userId)
                .orElseGet(() -> createNewLeaderboardEntry(userId, null));

        overallLeaderboard.setTotalScore(overallLeaderboard.getTotalScore() + result.getScore());
        overallLeaderboard.setGamesPlayed(overallLeaderboard.getGamesPlayed() + 1);
        leaderboardRepository.save(overallLeaderboard);
    }

    /**
     * Update GameStats when a reward is claimed
     */
    private void updateGameStatsRewardClaimed(UUID userId) {
        GameStats stats = gameStatsRepository.findByUserId(userId)
                .orElse(null);

        if (stats != null && stats.getRewardType() != null) {
            // Check if there are still unclaimed rewards
            long unclaimedCount = gameSessionRepository.countByUserIdAndRewardClaimedFalse(userId);

            if (unclaimedCount == 0) {
                // No more unclaimed rewards
                stats.setRewardClaimed(true);
                gameStatsRepository.save(stats);
            }
        }
    }

    private GameStats createNewGameStats(UUID userId) {
        return GameStats.builder()
                .userId(userId)
                .score(0)
                .gamesPlayed(0)
                .rewardClaimed(false)
                .build();
    }

    private Leaderboard createNewLeaderboardEntry(UUID userId, GameType gameType) {
        return Leaderboard.builder()
                .userId(userId)
                .gameType(gameType)
                .totalScore(0)
                .gamesPlayed(0)
                .build();
    }

    private GameSessionDTO toDTO(GameSession session) {
        return GameSessionDTO.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .gameType(session.getGameType())
                .score(session.getScore())
                .durationSeconds(session.getDurationSeconds())
                .rewardType(session.getRewardType())
                .rewardClaimed(session.getRewardClaimed())
                .playedAt(session.getPlayedAt())
                .build();
    }
}