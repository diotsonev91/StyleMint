package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.model.GameStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for GameStats aggregate
 * Each user has at most one GameStats record
 */
@Repository
public interface GameStatsRepository extends JpaRepository<GameStats, UUID> {

    /**
     * Find game stats by user ID
     * Each user has only one GameStats record
     */
    Optional<GameStats> findByUserId(UUID userId);

    /**
     * Check if user has game stats
     */
    boolean existsByUserId(UUID userId);

    /**
     * Delete game stats by user ID
     */
    void deleteByUserId(UUID userId);
}