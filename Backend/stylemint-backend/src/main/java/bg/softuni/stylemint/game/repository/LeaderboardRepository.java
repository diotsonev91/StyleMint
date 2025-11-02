package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.model.Leaderboard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, UUID> {

    /**
     * Find leaderboard entry for user and game type
     */
    Optional<Leaderboard> findByUserIdAndGameType(UUID userId, GameType gameType);

    /**
     * Find overall leaderboard entry for user (gameType = null)
     */
    Optional<Leaderboard> findByUserIdAndGameTypeIsNull(UUID userId);

    /**
     * Get top players for a specific game type
     */
    List<Leaderboard> findByGameTypeOrderByTotalScoreDesc(GameType gameType, Pageable pageable);

    /**
     * Get overall top players (gameType = null)
     */
    List<Leaderboard> findByGameTypeIsNullOrderByTotalScoreDesc(Pageable pageable);

    /**
     * Get all game types user has played
     */
    @Query("SELECT DISTINCT l.gameType FROM Leaderboard l WHERE l.userId = :userId AND l.gameType IS NOT NULL")
    List<GameType> findGameTypesByUserId(UUID userId);

    /**
     * Get user's rank for a game type
     */
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

    /**
     * Get user's overall rank
     */
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
}