package bg.softuni.stylemint.game.repository;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.model.Leaderboard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, UUID> {

    Optional<Leaderboard> findByUserIdAndGameType(UUID userId, GameType gameType);

    Optional<Leaderboard> findByUserIdAndGameTypeIsNull(UUID userId);

    List<Leaderboard> findByGameTypeOrderByTotalScoreDesc(GameType gameType, Pageable pageable);

    List<Leaderboard> findByGameTypeIsNullOrderByTotalScoreDesc(Pageable pageable);
}
