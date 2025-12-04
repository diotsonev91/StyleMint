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
import bg.softuni.stylemint.game.repository.LeaderboardRepository;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceImplTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LeaderboardRepository leaderboardRepository;

    @Mock
    private UserService userService;

    @Mock
    private DiscountService discountService;

    @InjectMocks
    private GameServiceImpl gameService;

    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_SESSION_ID = UUID.randomUUID();

    private GameSession testSession;
    private GameResultDTO testResult;
    private GameStats testStats;
    private Leaderboard testLeaderboard;
    private UserDTO testUser;

    @BeforeEach
    void setUp() {
        testSession = GameSession.builder()
                .id(TEST_SESSION_ID)
                .userId(TEST_USER_ID)
                .gameType(GameType.COLOR_RUSH)
                .score(100)
                .durationSeconds(60)
                .rewardType(RewardType.DISCOUNT_20)
                .rewardClaimed(false)
                .playedAt(OffsetDateTime.now())
                .nftMinted(false)
                .build();

        testResult = GameResultDTO.builder()
                .gameType(GameType.COLOR_RUSH)
                .score(100)
                .durationSeconds(60)
                .build();

        testStats = GameStats.builder()
                .id(UUID.randomUUID())
                .userId(TEST_USER_ID)
                .score(500)
                .gamesPlayed(5)
                .lastPlayedAt(OffsetDateTime.now())
                .rewardClaimed(false)
                .build();

        testLeaderboard = Leaderboard.builder()
                .id(UUID.randomUUID())
                .userId(TEST_USER_ID)
                .gameType(GameType.COLOR_RUSH)
                .totalScore(500)
                .gamesPlayed(5)
                .rank(10)
                .build();

        testUser = UserDTO.builder()
                .id(TEST_USER_ID)
                .email("test@example.com")
                .displayName("TestUser")
                .roles(Set.of(UserRole.CUSTOMER))
                .build();
    }

    // ========== recordGameSession Tests ==========

    @Test
    void recordGameSession_ShouldCreateSession_WithValidResult() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(0L);
        when(userService.findById(TEST_USER_ID)).thenReturn(testUser);
        when(gameRepository.existsByUserIdAndRewardType(TEST_USER_ID, RewardType.NFT_DISCOUNT_5))
                .thenReturn(false);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameType(TEST_USER_ID, GameType.COLOR_RUSH))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(TEST_USER_ID))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.save(any(Leaderboard.class))).thenReturn(testLeaderboard);

        // Act
        GameSessionDTO result = gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        assertNotNull(result);
        assertEquals(TEST_SESSION_ID, result.getId());
        assertEquals(100, result.getScore());
        verify(gameRepository).save(any(GameSession.class));
    }

    @Test
    void recordGameSession_ShouldGenerateReward_ForFirstGame() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(0L);
        when(userService.findById(TEST_USER_ID)).thenReturn(testUser);
        when(gameRepository.existsByUserIdAndRewardType(TEST_USER_ID, RewardType.NFT_DISCOUNT_5))
                .thenReturn(false);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameType(any(), any()))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(any()))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.save(any())).thenReturn(testLeaderboard);

        // Act
        gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        verify(gameRepository).save(argThat(session ->
                session.getRewardType() == RewardType.NFT_DISCOUNT_5
        ));
    }

    @Test
    void recordGameSession_ShouldUpdateLeaderboard() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(5L);
        when(userService.findById(TEST_USER_ID)).thenReturn(testUser);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.of(testStats));
        when(leaderboardRepository.findByUserIdAndGameType(TEST_USER_ID, GameType.COLOR_RUSH))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(TEST_USER_ID))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.save(any())).thenReturn(testLeaderboard);

        // Act
        gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        verify(leaderboardRepository, times(2)).save(any(Leaderboard.class));
    }

    // ========== getUserGameHistory Tests ==========

    @Test
    void getUserGameHistory_ShouldReturnLimitedResults() {
        // Arrange
        List<GameSession> sessions = Arrays.asList(testSession);
        PageRequest pageRequest = PageRequest.of(0, 10);

        when(gameRepository.findByUserIdOrderByPlayedAtDesc(TEST_USER_ID, pageRequest))
                .thenReturn(sessions);

        // Act
        List<GameSessionDTO> result = gameService.getUserGameHistory(TEST_USER_ID, 10);

        // Assert
        assertEquals(1, result.size());
        assertEquals(TEST_SESSION_ID, result.get(0).getId());
    }

    @Test
    void getUserGameHistory_ShouldReturnEmptyList_WhenNoGames() {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(gameRepository.findByUserIdOrderByPlayedAtDesc(TEST_USER_ID, pageRequest))
                .thenReturn(Collections.emptyList());

        // Act
        List<GameSessionDTO> result = gameService.getUserGameHistory(TEST_USER_ID, 10);

        // Assert
        assertTrue(result.isEmpty());
    }

    // ========== getUserGamesByType Tests ==========

    @Test
    void getUserGamesByType_ShouldReturnGamesOfType() {
        // Arrange
        when(gameRepository.findByUserIdAndGameType(TEST_USER_ID, GameType.COLOR_RUSH))
                .thenReturn(Arrays.asList(testSession));

        // Act
        List<GameSessionDTO> result = gameService.getUserGamesByType(TEST_USER_ID, GameType.COLOR_RUSH);

        // Assert
        assertEquals(1, result.size());
        assertEquals(GameType.COLOR_RUSH, result.get(0).getGameType());
    }

    // ========== claimReward Tests ==========

    @Test
    void claimReward_ShouldThrowException_WhenSessionNotFound() {
        // Arrange
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class,
                () -> gameService.claimReward(TEST_SESSION_ID, TEST_USER_ID));
    }

    @Test
    void claimReward_ShouldThrowException_WhenNotOwner() {
        // Arrange
        UUID differentUserId = UUID.randomUUID();
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.of(testSession));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class,
                () -> gameService.claimReward(TEST_SESSION_ID, differentUserId));
    }

    @Test
    void claimReward_ShouldThrowException_WhenNoReward() {
        // Arrange
        testSession.setRewardType(null);
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.of(testSession));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class,
                () -> gameService.claimReward(TEST_SESSION_ID, TEST_USER_ID));
    }

    @Test
    void claimReward_ShouldThrowException_WhenAlreadyClaimed() {
        // Arrange
        testSession.setRewardClaimed(true);
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.of(testSession));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class,
                () -> gameService.claimReward(TEST_SESSION_ID, TEST_USER_ID));
    }



    // ========== getUnclaimedRewards Tests ==========

    @Test
    void getUnclaimedRewards_ShouldReturnUnclaimedSessions() {
        // Arrange
        when(gameRepository.findByUserIdAndRewardClaimedFalse(TEST_USER_ID))
                .thenReturn(Arrays.asList(testSession));

        // Act
        List<GameSessionDTO> result = gameService.getUnclaimedRewards(TEST_USER_ID);

        // Assert
        assertEquals(1, result.size());
        assertFalse(result.get(0).getRewardClaimed());
    }

    // ========== getUserGameSummary Tests ==========

    @Test
    void getUserGameSummary_ShouldReturnSummary_WhenGamesPlayed() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(5L);
        when(gameRepository.getTotalScoreByUserId(TEST_USER_ID)).thenReturn(500L);
        when(gameRepository.findGameTypesByUserId(TEST_USER_ID))
                .thenReturn(Arrays.asList(GameType.COLOR_RUSH));
        when(gameRepository.countByUserIdAndRewardClaimedFalse(TEST_USER_ID)).thenReturn(2L);
        when(gameRepository.findByUserIdOrderByPlayedAtDesc(eq(TEST_USER_ID), any(PageRequest.class)))
                .thenReturn(Arrays.asList(testSession));
        when(gameRepository.getUserRankForGameType(TEST_USER_ID, GameType.COLOR_RUSH)).thenReturn(10);
        when(gameRepository.getUserOverallRank(TEST_USER_ID)).thenReturn(25);

        // Act
        UserGameSummaryDTO result = gameService.getUserGameSummary(TEST_USER_ID);

        // Assert
        assertEquals(500, result.getTotalScore());
        assertEquals(5, result.getGamesPlayed());
        assertEquals(2, result.getUnclaimedRewards());
        assertEquals(25, result.getTotalRank());
    }

    @Test
    void getUserGameSummary_ShouldReturnEmptySummary_WhenNoGames() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(0L);

        // Act
        UserGameSummaryDTO result = gameService.getUserGameSummary(TEST_USER_ID);

        // Assert
        assertEquals(0, result.getTotalScore());
        assertEquals(0, result.getGamesPlayed());
        assertTrue(result.getGameTypes().isEmpty());
    }

    // ========== NFT Minting Tests ==========

    @Test
    void getClaimedNftRewardsNotMinted_ShouldReturnSessions() {
        // Arrange
        when(gameRepository.findClaimedNftRewardsNotMinted())
                .thenReturn(Arrays.asList(testSession));

        // Act
        List<GameSession> result = gameService.getClaimedNftRewardsNotMinted();

        // Assert
        assertEquals(1, result.size());
        verify(gameRepository).findClaimedNftRewardsNotMinted();
    }

    @Test
    void markNftAsMinted_ShouldUpdateSession() {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.of(testSession));
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);

        // Act
        gameService.markNftAsMinted(TEST_SESSION_ID, tokenId);

        // Assert
        verify(gameRepository).save(argThat(session ->
                session.getNftMinted() && session.getNftTokenId().equals(tokenId)
        ));
    }

    @Test
    void markNftAsMinted_ShouldThrowException_WhenSessionNotFound() {
        // Arrange
        UUID tokenId = UUID.randomUUID();
        when(gameRepository.findById(TEST_SESSION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> gameService.markNftAsMinted(TEST_SESSION_ID, tokenId));
    }

    // ========== getUserScore Tests ==========

    @Test
    void getUserScore_ShouldReturnTotalScore() {
        // Arrange
        when(gameRepository.getTotalScoreByUserId(TEST_USER_ID)).thenReturn(1500L);

        // Act
        long score = gameService.getUserScore(TEST_USER_ID);

        // Assert
        assertEquals(1500L, score);
    }

    // ========== Leaderboard Tests ==========

    @Test
    void getLeaderboardByGameType_ShouldReturnGameTypeLeaderboard() {
        // Arrange
        User user = User.builder()
                .id(TEST_USER_ID)
                .displayName("TestUser")
                .avatarUrl("avatar.png")
                .build();

        when(gameRepository.findLeaderboardByGameTypeOrderByTotalScoreDesc(
                eq(GameType.COLOR_RUSH), any(PageRequest.class)))
                .thenReturn(Arrays.asList(testLeaderboard));
        when(userRepository.findAllById(anySet())).thenReturn(Arrays.asList(user));

        // Act
        List<LeaderboardEntryDTO> result = gameService.getLeaderboardByGameType(GameType.COLOR_RUSH, 10);

        // Assert
        assertEquals(1, result.size());
        assertEquals(GameType.COLOR_RUSH, result.get(0).getGameType());
    }

    @Test
    void getUserOverallRank_ShouldReturnRank() {
        // Arrange
        when(gameRepository.getUserOverallRank(TEST_USER_ID)).thenReturn(15);

        // Act
        int rank = gameService.getUserOverallRank(TEST_USER_ID);

        // Assert
        assertEquals(15, rank);
    }

    @Test
    void getUserOverallRank_ShouldReturnZero_WhenNoRank() {
        // Arrange
        when(gameRepository.getUserOverallRank(TEST_USER_ID)).thenReturn(null);

        // Act
        int rank = gameService.getUserOverallRank(TEST_USER_ID);

        // Assert
        assertEquals(0, rank);
    }

    @Test
    void getUserRankForGameType_ShouldReturnRank() {
        // Arrange
        when(gameRepository.getUserRankForGameType(TEST_USER_ID, GameType.COLOR_RUSH))
                .thenReturn(8);

        // Act
        int rank = gameService.getUserRankForGameType(TEST_USER_ID, GameType.COLOR_RUSH);

        // Assert
        assertEquals(8, rank);
    }

    // ========== Reward Generation Tests ==========

    @Test
    void generateReward_ShouldReturnNftDiscount5_ForFirstGame() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(0L);
        when(userService.findById(TEST_USER_ID)).thenReturn(testUser);
        when(gameRepository.existsByUserIdAndRewardType(TEST_USER_ID, RewardType.NFT_DISCOUNT_5))
                .thenReturn(false);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameType(any(), any()))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(any()))
                .thenReturn(Optional.empty());
        when(leaderboardRepository.save(any())).thenReturn(testLeaderboard);

        // Act
        gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        verify(gameRepository).save(argThat(session ->
                session.getRewardType() == RewardType.NFT_DISCOUNT_5
        ));
    }

    @Test
    void generateReward_ShouldReturnAuthorBadge_ForSecondGameWithAuthorRole() {
        // Arrange
        UserDTO authorUser = UserDTO.builder()
                .id(TEST_USER_ID)
                .email("author@example.com")
                .displayName("Author")
                .roles(Set.of(UserRole.CUSTOMER, UserRole.AUTHOR))
                .build();

        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(1L);
        when(userService.findById(TEST_USER_ID)).thenReturn(authorUser);
        when(gameRepository.existsByUserIdAndRewardType(TEST_USER_ID, RewardType.AUTHOR_BADGE_PRODUCER))
                .thenReturn(false);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.of(testStats));
        when(leaderboardRepository.findByUserIdAndGameType(any(), any()))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(any()))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.save(any())).thenReturn(testLeaderboard);

        // Act
        gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        verify(gameRepository).save(argThat(session ->
                session.getRewardType() == RewardType.AUTHOR_BADGE_PRODUCER
        ));
    }

    @Test
    void generateReward_ShouldReturnNftDiscount7_After100Games() {
        // Arrange
        when(gameRepository.countByUserId(TEST_USER_ID)).thenReturn(100L);
        when(userService.findById(TEST_USER_ID)).thenReturn(testUser);
        when(gameRepository.existsByUserIdAndRewardType(TEST_USER_ID, RewardType.NFT_DISCOUNT_7))
                .thenReturn(false);
        when(gameRepository.save(any(GameSession.class))).thenReturn(testSession);
        when(gameRepository.findGameStatsByUserId(TEST_USER_ID)).thenReturn(Optional.of(testStats));
        when(leaderboardRepository.findByUserIdAndGameType(any(), any()))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.findByUserIdAndGameTypeIsNull(any()))
                .thenReturn(Optional.of(testLeaderboard));
        when(leaderboardRepository.save(any())).thenReturn(testLeaderboard);

        // Act
        gameService.recordGameSession(TEST_USER_ID, testResult);

        // Assert
        verify(gameRepository).save(argThat(session ->
                session.getRewardType() == RewardType.NFT_DISCOUNT_7
        ));
    }
}