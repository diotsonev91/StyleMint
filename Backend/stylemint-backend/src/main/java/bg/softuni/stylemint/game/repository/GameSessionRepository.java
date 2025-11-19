package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.game.model.GameSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, UUID> {

    /**
     * Find all game sessions by user
     */
    List<GameSession> findByUserId(UUID userId);

    /**
     * Find recent game sessions by user (paginated)
     */
    List<GameSession> findByUserIdOrderByPlayedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find game sessions by user and game type
     */
    List<GameSession> findByUserIdAndGameType(UUID userId, GameType gameType);

    /**
     * Count total games played by user
     */
    long countByUserId(UUID userId);

    /**
     * Find sessions with unclaimed rewards
     */
    List<GameSession> findByUserIdAndRewardClaimedFalse(UUID userId);

    /**
     * Find sessions played after a certain date
     */
    List<GameSession> findByUserIdAndPlayedAtAfter(UUID userId, OffsetDateTime date);

    /**
     * Get total score for a user
     */
    @Query("SELECT COALESCE(SUM(gs.score), 0) FROM GameSession gs WHERE gs.userId = :userId")
    long getTotalScoreByUserId(UUID userId);

    /**
     * Get average score for a user
     */
    @Query("SELECT COALESCE(AVG(gs.score), 0) FROM GameSession gs WHERE gs.userId = :userId")
    double getAverageScoreByUserId(UUID userId);

    /**
     * Count unclaimed rewards for a user
     */
    long countByUserIdAndRewardClaimedFalse(UUID userId);

    boolean existsByUserIdAndRewardType(UUID userId, RewardType rewardType);
}