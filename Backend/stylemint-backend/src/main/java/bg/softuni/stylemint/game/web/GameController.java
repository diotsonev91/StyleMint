package bg.softuni.stylemint.game.web;

import bg.softuni.stylemint.game.dto.GameResultDTO;
import bg.softuni.stylemint.game.dto.GameSessionDTO;
import bg.softuni.stylemint.game.dto.LeaderboardEntryDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.service.GameService;
import bg.softuni.stylemint.game.service.GameStatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

/**
 * GameController with PRINCIPAL authentication
 * Cleanest approach - just use Principal parameter
 */
@RestController
@RequestMapping(BASE + "/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final GameStatsService gameStatsService;

    /**
     * Submit game result and create new session
     * Uses Principal to get userId from JWT
     */
    @PostMapping("/submit")
    public ResponseEntity<GameSessionDTO> submitGame(
            Principal principal,  // ← Simple and clean
            @Valid @RequestBody GameResultDTO result) {

        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.recordGameSession(userId, result));
    }

    /**
     * Get current user's game summary/statistics
     */
    @GetMapping("/summary")
    public ResponseEntity<UserGameSummaryDTO> getUserGameSummary(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.getUserGameSummary(userId));
    }

    /**
     * Get current user's total score
     */
    @GetMapping("/score")
    public ResponseEntity<Long> getUserScore(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameStatsService.getUserScore(userId));
    }

    /**
     * Get current user's game history
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<GameSessionDTO>> getGameHistory(
            Principal principal,
            @RequestParam(defaultValue = "20") int limit) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.getUserGameHistory(userId, limit));
    }

    /**
     * Get current user's games by type
     */
    @GetMapping("/type/{gameType}")
    public ResponseEntity<List<GameSessionDTO>> getGamesByType(
            Principal principal,
            @PathVariable GameType gameType) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.getUserGamesByType(userId, gameType));
    }

    /**
     * Get current user's unclaimed rewards
     */
    @GetMapping("/rewards/unclaimed")
    public ResponseEntity<List<GameSessionDTO>> getUnclaimedRewards(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.getUnclaimedRewards(userId));
    }

    /**
     * Claim reward from a game session
     */
    @PostMapping("/sessions/{sessionId}/claim-reward")
    public ResponseEntity<GameSessionDTO> claimReward(
            Principal principal,
            @PathVariable UUID sessionId) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(gameService.claimReward(sessionId, userId));
    }

    /**
     * Get leaderboard for a specific game type
     */
    @GetMapping("/leaderboard/{gameType}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboardByGameType(
            @PathVariable GameType gameType,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(gameStatsService.getLeaderboardByGameType(gameType, limit));
    }

    /**
     * Get global leaderboard (all games combined)
     */
    @GetMapping("/leaderboard/global")
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(gameStatsService.getOverallLeaderboard(limit));
    }

    /**
     * Get user's best score for a game type
     */
    @GetMapping("/best-score/{gameType}")
    public ResponseEntity<Map<String, Integer>> getBestScore(
            Principal principal,
            @PathVariable GameType gameType) {
        UUID userId = UUID.fromString(principal.getName());

        List<GameSessionDTO> sessions = gameService.getUserGamesByType(userId, gameType);

        int bestScore = sessions.stream()
                .mapToInt(GameSessionDTO::getScore)
                .max()
                .orElse(0);

        return ResponseEntity.ok(Map.of("bestScore", bestScore));
    }

    /**
     * Get user's rank for a game type
     */
    @GetMapping("/rank/{gameType}")
    public ResponseEntity<Map<String, Object>> getUserRank(
            Principal principal,
            @PathVariable GameType gameType) {
        UUID userId = UUID.fromString(principal.getName());
        int rank = gameStatsService.getUserRankForGameType(userId, gameType);

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "rank", rank,
                "gameType", gameType.name()
        ));
    }

    /**
     * Get specific game session by ID
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<GameSessionDTO> getSessionById(@PathVariable UUID sessionId) {
        // TODO: Implement in GameService
        return ResponseEntity.notFound().build();
    }
}