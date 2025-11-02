package bg.softuni.stylemint.game.web;

import bg.softuni.stylemint.game.dto.LeaderboardEntryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.service.GameStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final GameStatsService gameStatsService;

    /**
     * Get overall leaderboard (all games combined)
     */
    @GetMapping("/overall")
    public ResponseEntity<List<LeaderboardEntryDTO>> getOverallLeaderboard(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(gameStatsService.getOverallLeaderboard(limit));
    }

    /**
     * Get leaderboard for a specific game type
     */
    @GetMapping("/game-type/{gameType}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboardByGameType(
            @PathVariable GameType gameType,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(gameStatsService.getLeaderboardByGameType(gameType, limit));
    }

    /**
     * Get user's overall rank
     */
    @GetMapping("/users/{userId}/rank/overall")
    public ResponseEntity<Map<String, Object>> getUserOverallRank(@PathVariable UUID userId) {
        int rank = gameStatsService.getUserOverallRank(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "rank", rank,
                "gameType", "OVERALL"
        ));
    }

    /**
     * Get user's rank for a specific game type
     */
    @GetMapping("/users/{userId}/rank/game-type/{gameType}")
    public ResponseEntity<Map<String, Object>> getUserRankForGameType(
            @PathVariable UUID userId,
            @PathVariable GameType gameType) {
        int rank = gameStatsService.getUserRankForGameType(userId, gameType);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "rank", rank,
                "gameType", gameType.name()
        ));
    }
}