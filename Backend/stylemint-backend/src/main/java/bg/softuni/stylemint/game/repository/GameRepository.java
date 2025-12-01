package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.game.model.GameSession;
import bg.softuni.stylemint.game.model.GameStats;
import bg.softuni.stylemint.game.model.Leaderboard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<GameSession, UUID> {

    // ========== GAME SESSION METHODS ==========

    List<GameSession> findByUserId(UUID userId);
    List<GameSession> findByUserIdOrderByPlayedAtDesc(UUID userId, Pageable pageable);
    List<GameSession> findByUserIdAndGameType(UUID userId, GameType gameType);
    long countByUserId(UUID userId);
    List<GameSession> findByUserIdAndRewardClaimedFalse(UUID userId);
    boolean existsByUserIdAndRewardType(UUID userId, RewardType rewardType);
    long countByUserIdAndRewardClaimedFalse(UUID userId);

    @Query("SELECT COALESCE(SUM(gs.score), 0) FROM GameSession gs WHERE gs.userId = :userId")
    long getTotalScoreByUserId(UUID userId);

    @Query("SELECT COALESCE(AVG(gs.score), 0) FROM GameSession gs WHERE gs.userId = :userId")
    double getAverageScoreByUserId(UUID userId);

    @Query("""
    SELECT g FROM GameSession g 
    WHERE g.rewardClaimed = true 
    AND g.nftMinted = false
    AND g.rewardType IN (
        bg.softuni.stylemint.game.enums.RewardType.NFT_DISCOUNT_5,
        bg.softuni.stylemint.game.enums.RewardType.NFT_DISCOUNT_7,
        bg.softuni.stylemint.game.enums.RewardType.AUTHOR_BADGE_DESIGNER,
        bg.softuni.stylemint.game.enums.RewardType.AUTHOR_BADGE_PRODUCER
    )
""")
    List<GameSession> findClaimedNftRewardsNotMinted();

    // ========== GAME STATS METHODS ==========

    @Query("SELECT gs FROM GameStats gs WHERE gs.userId = :userId")
    Optional<GameStats> findGameStatsByUserId(UUID userId);

    @Query("SELECT CASE WHEN COUNT(gs) > 0 THEN true ELSE false END FROM GameStats gs WHERE gs.userId = :userId")
    boolean existsGameStatsByUserId(UUID userId);

    @Query("DELETE FROM GameStats gs WHERE gs.userId = :userId")
    void deleteGameStatsByUserId(UUID userId);

    // ========== LEADERBOARD METHODS ==========

    @Query("SELECT l FROM Leaderboard l WHERE l.userId = :userId AND l.gameType = :gameType")
    Optional<Leaderboard> findLeaderboardByUserIdAndGameType(UUID userId, GameType gameType);

    @Query("SELECT l FROM Leaderboard l WHERE l.userId = :userId AND l.gameType IS NULL")
    Optional<Leaderboard> findLeaderboardByUserIdAndGameTypeIsNull(UUID userId);

    @Query("SELECT l FROM Leaderboard l WHERE l.gameType = :gameType ORDER BY l.totalScore DESC")
    List<Leaderboard> findLeaderboardByGameTypeOrderByTotalScoreDesc(GameType gameType, Pageable pageable);

    @Query("SELECT l FROM Leaderboard l WHERE l.gameType IS NULL ORDER BY l.totalScore DESC")
    List<Leaderboard> findLeaderboardByGameTypeIsNullOrderByTotalScoreDesc(Pageable pageable);

    @Query("SELECT DISTINCT l.gameType FROM Leaderboard l WHERE l.userId = :userId AND l.gameType IS NOT NULL")
    List<GameType> findGameTypesByUserId(UUID userId);

    @Query("""
        SELECT COUNT(l) + 1 
        FROM Leaderboard l 
        WHERE l.gameType = :gameType 
        AND l.totalScore > (
            SELECT l2.totalScore 
            FROM Leaderboard l2 
            WHERE l2.userId = :userId AND l2.gameType = :gameType
        )
    """)
    Integer getUserRankForGameType(UUID userId, GameType gameType);

    @Query("""
        SELECT COUNT(l) + 1 
        FROM Leaderboard l 
        WHERE l.gameType IS NULL 
        AND l.totalScore > (
            SELECT l2.totalScore 
            FROM Leaderboard l2 
            WHERE l2.userId = :userId AND l2.gameType IS NULL
        )
    """)
    Integer getUserOverallRank(UUID userId);


    long countByScoreGreaterThanEqual(int score);

    // Optional: For high scores by unique users
    @Query("SELECT COUNT(DISTINCT g.userId) FROM GameSession g WHERE g.score >= :minScore")
    long countDistinctUsersWithHighScore(@Param("minScore") int minScore);

    // Ako nqmashe distinct users count method:
    @Query("SELECT COUNT(DISTINCT g.userId) FROM GameSession g WHERE g.playedAt >= :since")
    long countDistinctUsersSince(@Param("since") OffsetDateTime since);
}