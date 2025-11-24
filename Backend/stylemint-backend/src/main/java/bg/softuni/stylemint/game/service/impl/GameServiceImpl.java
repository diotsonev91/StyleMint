// GameServiceImpl.java - UPDATED with DiscountService
package bg.softuni.stylemint.game.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.game.dto.*;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.game.model.GameSession;
import bg.softuni.stylemint.game.model.GameStats;
import bg.softuni.stylemint.game.model.Leaderboard;
import bg.softuni.stylemint.game.repository.GameRepository;
import bg.softuni.stylemint.game.service.GameService;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final DiscountService discountService; // ✅ NEW

    // ========== GAME SESSION METHODS ==========

    @Override
    public GameSessionDTO recordGameSession(UUID userId, GameResultDTO result) {
        RewardType reward = generateReward(userId);

        GameSession session = GameSession.builder()
                .userId(userId)
                .gameType(result.getGameType())
                .score(result.getScore())
                .durationSeconds(result.getDurationSeconds())
                .rewardType(reward)
                .rewardClaimed(false)
                .build();

        GameSession savedSession = gameRepository.save(session);

        // Update aggregates
        updateGameStats(userId, result);
        updateLeaderboard(userId, result);

        return toSessionDTO(savedSession);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUserGameHistory(UUID userId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        return gameRepository.findByUserIdOrderByPlayedAtDesc(userId, pageRequest)
                .stream()
                .map(this::toSessionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUserGamesByType(UUID userId, GameType gameType) {
        return gameRepository.findByUserIdAndGameType(userId, gameType)
                .stream()
                .map(this::toSessionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GameSessionDTO claimReward(UUID sessionId, UUID userId) {
        GameSession session = gameRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Game session not found"));

        // Verify ownership
        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("You don't have permission to claim this reward");
        }

        if (session.getRewardType() == null) {
            throw new ForbiddenOperationException("This session has no reward");
        }

        if (Boolean.TRUE.equals(session.getRewardClaimed())) {
            throw new ForbiddenOperationException("Reward already claimed");
        }

        // ✅ NEW: Handle discount rewards
        if (isDiscountReward(session.getRewardType())) {
            discountService.saveDiscount(userId, session.getRewardType());
            log.info("✅ Saved {} discount for user {}", session.getRewardType(), userId);
        }

        // ✅ NFT rewards are handled elsewhere (NftServiceFacade)
        // - NFT_DISCOUNT_5, NFT_DISCOUNT_7
        // - AUTHOR_BADGE_PRODUCER, AUTHOR_BADGE_DESIGNER

        session.setRewardClaimed(true);
        GameSession updated = gameRepository.save(session);

        // Update stats
        updateGameStatsRewardClaimed(userId);

        return toSessionDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameSessionDTO> getUnclaimedRewards(UUID userId) {
        return gameRepository.findByUserIdAndRewardClaimedFalse(userId)
                .stream()
                .map(this::toSessionDTO)
                .collect(Collectors.toList());
    }

    // ========== STATISTICS METHODS ==========

    @Override
    @Transactional(readOnly = true)
    public UserGameSummaryDTO getUserGameSummary(UUID userId) {
        long gamesPlayed = gameRepository.countByUserId(userId);

        if (gamesPlayed == 0) {
            return UserGameSummaryDTO.builder()
                    .totalScore(0)
                    .gamesPlayed(0)
                    .gameTypes(Collections.emptySet())
                    .unclaimedRewards(0)
                    .lastPlayedAt(null)
                    .lastRewardType(null)
                    .ranks(Collections.emptyMap())
                    .totalRank(0)
                    .build();
        }

        long totalScore = gameRepository.getTotalScoreByUserId(userId);
        Set<GameType> gameTypes = gameRepository.findGameTypesByUserId(userId)
                .stream()
                .collect(Collectors.toSet());
        long unclaimedRewards = gameRepository.countByUserIdAndRewardClaimedFalse(userId);

        List<GameSession> recentSessions = gameRepository.findByUserIdOrderByPlayedAtDesc(
                userId, PageRequest.of(0, 1)
        );
        GameSession lastSession = recentSessions.isEmpty() ? null : recentSessions.get(0);

        // Get ranks for each game type and overall rank
        Map<GameType, Integer> ranks = calculateRanksByGameType(userId, gameTypes);
        int totalRank = gameRepository.getUserOverallRank(userId);

        return UserGameSummaryDTO.builder()
                .totalScore((int) totalScore)
                .gamesPlayed((int) gamesPlayed)
                .gameTypes(gameTypes)
                .unclaimedRewards((int) unclaimedRewards)
                .lastPlayedAt(lastSession != null ? lastSession.getPlayedAt() : null)
                .lastRewardType(lastSession != null ? lastSession.getRewardType() : null)
                .ranks(ranks)
                .totalRank(totalRank)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUserScore(UUID userId) {
        return gameRepository.getTotalScoreByUserId(userId);
    }

    // ========== LEADERBOARD METHODS ==========

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDTO> getOverallLeaderboard(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Leaderboard> leaderboardEntries = gameRepository
                .findLeaderboardByGameTypeIsNullOrderByTotalScoreDesc(pageRequest);

        return convertToLeaderboardDTOs(leaderboardEntries, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryDTO> getLeaderboardByGameType(GameType gameType, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Leaderboard> leaderboardEntries = gameRepository
                .findLeaderboardByGameTypeOrderByTotalScoreDesc(gameType, pageRequest);

        return convertToLeaderboardDTOs(leaderboardEntries, gameType);
    }

    @Override
    @Transactional(readOnly = true)
    public int getUserOverallRank(UUID userId) {
        Integer rank = gameRepository.getUserOverallRank(userId);
        return rank != null ? rank : 0;
    }

    @Override
    @Transactional(readOnly = true)
    public int getUserRankForGameType(UUID userId, GameType gameType) {
        Integer rank = gameRepository.getUserRankForGameType(userId, gameType);
        return rank != null ? rank : 0;
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Calculate ranks for each game type
     */
    private Map<GameType, Integer> calculateRanksByGameType(UUID userId, Set<GameType> gameTypes) {
        Map<GameType, Integer> ranks = new HashMap<>();

        for (GameType gameType : gameTypes) {
            Integer rank = gameRepository.getUserRankForGameType(userId, gameType);
            ranks.put(gameType, rank != null ? rank : 0);
        }

        return ranks;
    }

    private void updateGameStats(UUID userId, GameResultDTO result) {
        GameStats stats = gameRepository.findGameStatsByUserId(userId)
                .orElseGet(() -> createNewGameStats(userId));

        stats.setScore(stats.getScore() + result.getScore());
        stats.setGamesPlayed(stats.getGamesPlayed() + 1);
        stats.setLastPlayedAt(OffsetDateTime.now());

        if (result.getRewardType() != null) {
            stats.setRewardType(result.getRewardType());
            stats.setRewardClaimed(false);
        }
    }

    private void updateLeaderboard(UUID userId, GameResultDTO result) {
        // Update game-specific leaderboard
        if (result.getGameType() != null) {
            Leaderboard gameTypeLeaderboard = gameRepository
                    .findLeaderboardByUserIdAndGameType(userId, result.getGameType())
                    .orElseGet(() -> createNewLeaderboardEntry(userId, result.getGameType()));

            gameTypeLeaderboard.setTotalScore(gameTypeLeaderboard.getTotalScore() + result.getScore());
            gameTypeLeaderboard.setGamesPlayed(gameTypeLeaderboard.getGamesPlayed() + 1);
        }

        // Update overall leaderboard
        Leaderboard overallLeaderboard = gameRepository
                .findLeaderboardByUserIdAndGameTypeIsNull(userId)
                .orElseGet(() -> createNewLeaderboardEntry(userId, null));

        overallLeaderboard.setTotalScore(overallLeaderboard.getTotalScore() + result.getScore());
        overallLeaderboard.setGamesPlayed(overallLeaderboard.getGamesPlayed() + 1);
    }

    private void updateGameStatsRewardClaimed(UUID userId) {
        GameStats stats = gameRepository.findGameStatsByUserId(userId).orElse(null);

        if (stats != null && stats.getRewardType() != null) {
            long unclaimedCount = gameRepository.countByUserIdAndRewardClaimedFalse(userId);
            if (unclaimedCount == 0) {
                stats.setRewardClaimed(true);
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

    private List<LeaderboardEntryDTO> convertToLeaderboardDTOs(List<Leaderboard> entries, GameType gameType) {
        Set<UUID> userIds = entries.stream()
                .map(Leaderboard::getUserId)
                .collect(Collectors.toSet());

        Map<UUID, User> usersMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        List<LeaderboardEntryDTO> dtos = new ArrayList<>();
        int rank = 1;

        for (Leaderboard entry : entries) {
            User user = usersMap.get(entry.getUserId());
            if (user != null) {
                dtos.add(LeaderboardEntryDTO.builder()
                        .gameType(gameType)
                        .userId(user.getId())
                        .displayName(user.getDisplayName())
                        .avatarUrl(user.getAvatarUrl())
                        .totalScore(entry.getTotalScore())
                        .rank(rank++)
                        .build());
            }
        }

        return dtos;
    }

    private GameSessionDTO toSessionDTO(GameSession session) {
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

    private RewardType generateReward(UUID userId) {
        long gamesPlayed = gameRepository.countByUserId(userId);
        UserDTO user = userService.findById(userId);

        boolean isAuthor = user.getRoles().contains("AUTHOR");
        boolean isDesigner = user.getRoles().contains("DESIGNER");

        // First game
        if (gamesPlayed == 0) {
            if (doesNotHaveReward(userId, RewardType.NFT_DISCOUNT_5)) {
                return RewardType.NFT_DISCOUNT_5;
            }
        }

        // Second game
        if (gamesPlayed == 1) {
            if (isAuthor && doesNotHaveReward(userId, RewardType.AUTHOR_BADGE_PRODUCER)) {
                return RewardType.AUTHOR_BADGE_PRODUCER;
            }
            if (isDesigner && doesNotHaveReward(userId, RewardType.AUTHOR_BADGE_DESIGNER)) {
                return RewardType.AUTHOR_BADGE_DESIGNER;
            }
        }

        // Games 2-99
        if (gamesPlayed >= 2 && gamesPlayed < 100) {
            return Math.random() < 0.5 ? RewardType.DISCOUNT_20 : RewardType.DISCOUNT_40;
        }

        // After 100 games
        if (gamesPlayed >= 100) {
            if (doesNotHaveReward(userId, RewardType.NFT_DISCOUNT_7)) {
                return RewardType.NFT_DISCOUNT_7;
            }
            return Math.random() < 0.5 ? RewardType.DISCOUNT_20 : RewardType.DISCOUNT_40;
        }

        return null;
    }

    private boolean doesNotHaveReward(UUID userId, RewardType rewardType) {
        return !gameRepository.existsByUserIdAndRewardType(userId, rewardType);
    }

    /**
     * ✅ NEW: Check if reward is a discount type
     */
    private boolean isDiscountReward(RewardType rewardType) {
        return rewardType == RewardType.DISCOUNT_20 || rewardType == RewardType.DISCOUNT_40;
    }
}