package bg.softuni.stylemint.game.web;

import bg.softuni.stylemint.game.service.impl.GameStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/games/stats")
@RequiredArgsConstructor
public class GameStatsController {

    private final GameStatsService gameStatsService;

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = Map.of(
                "activePlayers", gameStatsService.getActivePlayersCount(),
                "totalGamesPlayed", gameStatsService.getTotalGamesPlayed(),
                "totalHighScores", gameStatsService.getTotalHighScores()
        );
        return ResponseEntity.ok(stats);
    }
}