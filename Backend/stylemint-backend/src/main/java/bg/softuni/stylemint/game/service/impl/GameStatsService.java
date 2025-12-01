package bg.softuni.stylemint.game.service.impl;

import bg.softuni.stylemint.game.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameStatsService {

    private final GameRepository gameRepository;

    /**
     * Get count of unique players who played in the last 30 days
     */
    public long getActivePlayersCount() {
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        return gameRepository.countDistinctUsersSince(thirtyDaysAgo);
    }

    /**
     * Get total number of games played
     */
    public long getTotalGamesPlayed() {
        return gameRepository.count();
    }

    /**
     * Get count of high scores (scores above a certain threshold)
     */
    public long getTotalHighScores() {
        int highScoreThreshold = 50; // Adjust based on your game
        return gameRepository.countByScoreGreaterThanEqual(highScoreThreshold);
    }

    /**
     * Alternative: Count unique users with high scores
     */
    public long getTotalHighScoresAlternative() {
        int highScoreThreshold = 50;
        return gameRepository.countDistinctUsersWithHighScore(highScoreThreshold);
    }
}
