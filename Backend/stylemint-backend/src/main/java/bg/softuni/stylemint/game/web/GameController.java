package bg.softuni.stylemint.game.web;

import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.game.dto.GameResultDTO;
import bg.softuni.stylemint.game.dto.GameSessionDTO;
import bg.softuni.stylemint.game.dto.LeaderboardEntryDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

/**
 * GameController - Uses JWT-based authentication with @AuthenticationPrincipal
 */
@RestController
@RequestMapping(BASE + "/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * Submit game result and create new session
     */
    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameSessionDTO> submitGame(
            @Valid @RequestBody GameResultDTO result,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.recordGameSession(userId, result));
    }

    /**
     * Get current user's game summary/statistics
     */
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserGameSummaryDTO> getUserGameSummary(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.getUserGameSummary(userId));
    }

    /**
     * Get current user's total score
     */
    @GetMapping("/score")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUserScore(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.getUserScore(userId));
    }

    /**
     * Get current user's game history
     */
    @GetMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GameSessionDTO>> getGameHistory(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.getUserGameHistory(userId, limit));
    }

    /**
     * Get current user's games by type
     */
    @GetMapping("/type/{gameType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GameSessionDTO>> getGamesByType(
            @PathVariable GameType gameType,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.getUserGamesByType(userId, gameType));
    }

    /**
     * Get current user's unclaimed rewards
     */
    @GetMapping("/rewards/unclaimed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GameSessionDTO>> getUnclaimedRewards(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.getUnclaimedRewards(userId));
    }

    /**
     * Claim reward from a game session
     */
    @PostMapping("/sessions/{sessionId}/claim-reward")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameSessionDTO> claimReward(
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        return ResponseEntity.ok(gameService.claimReward(sessionId, userId));
    }

    /**
     * Get leaderboard for a specific game type
     */
    @GetMapping("/leaderboard/{gameType}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboardByGameType(
            @PathVariable GameType gameType,
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(gameService.getLeaderboardByGameType(gameType, limit));
    }

    /**
     * Get global leaderboard (all games combined)
     */
    @GetMapping("/leaderboard/global")
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(gameService.getOverallLeaderboard(limit));
    }

    /**
     * Get user's best score for a game type
     */
    @GetMapping("/best-score/{gameType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getBestScore(
            @PathVariable GameType gameType,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();

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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUserRank(
            @PathVariable GameType gameType,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        int rank = gameService.getUserRankForGameType(userId, gameType);

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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameSessionDTO> getSessionById(@PathVariable UUID sessionId) {
        // TODO: Implement in GameService
        return ResponseEntity.notFound().build();
    }
}