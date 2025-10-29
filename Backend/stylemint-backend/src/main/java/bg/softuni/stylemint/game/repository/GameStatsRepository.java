package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.model.GameStats;
import bg.softuni.stylemint.game.enums.RewardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameStatsRepository extends JpaRepository<GameStats, UUID> {


    Optional<GameStats> findByUserId(UUID userId);


    List<GameStats> findByRewardClaimedFalse();


    List<GameStats> findByRewardType(RewardType rewardType);


    List<GameStats> findByRewardTypeAndRewardClaimedFalse(RewardType rewardType);

    /**
     * Find users who played after specific date
     */
    List<GameStats> findByLastPlayedAtAfter(OffsetDateTime date);

    /**
     * Find top players by score
     */
    List<GameStats> findTop10ByOrderByScoreDesc();

    /**
     * Find most active players by games played
     */
    List<GameStats> findTop10ByOrderByGamesPlayedDesc();

    /**
     * Count users with unclaimed rewards
     */
    long countByRewardClaimedFalse();

    /**
     * Check if user has stats
     */
    boolean existsByUserId(UUID userId);

    /**
     * Check if user has unclaimed reward
     */
    boolean existsByUserIdAndRewardClaimedFalse(UUID userId);

    /**
     * Paginated leaderboard
     */
    Page<GameStats> findAllByOrderByScoreDesc(Pageable pageable);

    /**
     * Custom query: Update user score
     */
    @Modifying
    @Query("UPDATE GameStats gs SET gs.score = gs.score + :points, " +
            "gs.gamesPlayed = gs.gamesPlayed + 1, " +
            "gs.lastPlayedAt = :playedAt WHERE gs.userId = :userId")
    int updateUserScore(
            @Param("userId") UUID userId,
            @Param("points") Integer points,
            @Param("playedAt") OffsetDateTime playedAt
    );

    /**
     * Custom query: Claim reward
     */
    @Modifying
    @Query("UPDATE GameStats gs SET gs.rewardClaimed = true WHERE gs.userId = :userId")
    int claimReward(@Param("userId") UUID userId);

    /**
     * Custom query: Set reward for user
     */
    @Modifying
    @Query("UPDATE GameStats gs SET gs.rewardType = :rewardType, gs.rewardClaimed = false WHERE gs.userId = :userId")
    int setUserReward(@Param("userId") UUID userId, @Param("rewardType") RewardType rewardType);

    /**
     * Custom query: Get leaderboard with rank
     */
    @Query("SELECT gs, " +
            "(SELECT COUNT(gs2) FROM GameStats gs2 WHERE gs2.score > gs.score) + 1 as rank " +
            "FROM GameStats gs ORDER BY gs.score DESC")
    List<Object[]> getLeaderboardWithRanks(Pageable pageable);

    /**
     * Custom query: Get user rank
     */
    @Query("SELECT COUNT(gs) + 1 FROM GameStats gs WHERE gs.score > " +
            "(SELECT gs2.score FROM GameStats gs2 WHERE gs2.userId = :userId)")
    Long getUserRank(@Param("userId") UUID userId);

    /**
     * Custom query: Get average score
     */
    @Query("SELECT AVG(gs.score) FROM GameStats gs")
    Double getAverageScore();

    /**
     * Custom query: Get total games played
     */
    @Query("SELECT SUM(gs.gamesPlayed) FROM GameStats gs")
    Long getTotalGamesPlayed();

    /**
     * Custom query: Find active players (played in last N days)
     */
    @Query("SELECT gs FROM GameStats gs WHERE gs.lastPlayedAt >= :sinceDate ORDER BY gs.lastPlayedAt DESC")
    List<GameStats> findActivePlayers(@Param("sinceDate") OffsetDateTime sinceDate);
}