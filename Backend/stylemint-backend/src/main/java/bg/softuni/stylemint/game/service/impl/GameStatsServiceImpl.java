package bg.softuni.stylemint.game.service.impl;

import bg.softuni.stylemint.game.dto.LeaderboardEntryDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.model.GameSession;
import bg.softuni.stylemint.game.model.Leaderboard;
import bg.softuni.stylemint.game.repository.GameSessionRepository;
import bg.softuni.stylemint.game.repository.GameStatsRepository;
import bg.softuni.stylemint.game.repository.LeaderboardRepository;
import bg.softuni.stylemint.game.service.GameStatsService;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameStatsServiceImpl implements GameStatsService {

    private final GameSessionRepository gameSessionRepository;
    private final GameStatsRepository gameStatsRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;

    @Override
    public long getUserScore(UUID userId) {
        // Use optimized query to get total score
        return gameSessionRepository.getTotalScoreByUserId(userId);
    }

    @Override
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
    public List<LeaderboardEntryDTO> getOverallLeaderboard(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Leaderboard> leaderboardEntries = leaderboardRepository
                .findByGameTypeIsNullOrderByTotalScoreDesc(pageRequest);

        return convertToLeaderboardDTOs(leaderboardEntries, null);
    }

    @Override
    public List<LeaderboardEntryDTO> getLeaderboardByGameType(GameType gameType, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Leaderboard> leaderboardEntries = leaderboardRepository
                .findByGameTypeOrderByTotalScoreDesc(gameType, pageRequest);

        return convertToLeaderboardDTOs(leaderboardEntries, gameType);
    }

    @Override
    public int getUserOverallRank(UUID userId) {
        Integer rank = leaderboardRepository.getUserOverallRank(userId);
        return rank != null ? rank : 0;
    }

    @Override
    public int getUserRankForGameType(UUID userId, GameType gameType) {
        Integer rank = leaderboardRepository.getUserRankForGameType(userId, gameType);
        return rank != null ? rank : 0;
    }

    /**
     * Convert Leaderboard entities to DTOs with user information
     */
    private List<LeaderboardEntryDTO> convertToLeaderboardDTOs(
            List<Leaderboard> leaderboardEntries,
            GameType gameType) {

        // Get all user IDs
        Set<UUID> userIds = leaderboardEntries.stream()
                .map(Leaderboard::getUserId)
                .collect(Collectors.toSet());

        // Fetch users in batch
        Map<UUID, User> usersMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Convert to DTOs with rank
        List<LeaderboardEntryDTO> dtos = new ArrayList<>();
        int rank = 1;

        for (Leaderboard entry : leaderboardEntries) {
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
}