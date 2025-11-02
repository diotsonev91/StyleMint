package bg.softuni.stylemint.game.web;

import bg.softuni.stylemint.game.dto.GameResultDTO;
import bg.softuni.stylemint.game.dto.GameSessionDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.service.GameService;
import bg.softuni.stylemint.game.service.GameStatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final GameStatsService gameStatsService;

    /**
     * Submit game result and create new session
     */
    @PostMapping("/play")
    @PreAuthorize("@userSecurity.canModifyUser(#userId)")
    public ResponseEntity<GameSessionDTO> playGame(
            @RequestParam UUID userId,
            @Valid @RequestBody GameResultDTO result) {
        return ResponseEntity.ok(gameService.recordGameSession(userId, result));
    }

    /**
     * Get user's game summary/statistics
     * Used in user profile
     */
    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<UserGameSummaryDTO> getUserGameSummary(@PathVariable UUID userId) {
        return ResponseEntity.ok(gameService.getUserGameSummary(userId));  // ← From GameService
    }

    /**
     * Get user's total score
     */
    @GetMapping("/users/{userId}/score")
    public ResponseEntity<Long> getUserScore(@PathVariable UUID userId) {
        return ResponseEntity.ok(gameStatsService.getUserScore(userId));  // ← From GameStatsService
    }

    /**
     * Get user's game history
     */
    @GetMapping("/users/{userId}/history")
    public ResponseEntity<List<GameSessionDTO>> getGameHistory(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(gameService.getUserGameHistory(userId, limit));
    }

    /**
     * Get user's games by type
     */
    @GetMapping("/users/{userId}/type/{gameType}")
    public ResponseEntity<List<GameSessionDTO>> getGamesByType(
            @PathVariable UUID userId,
            @PathVariable GameType gameType) {
        return ResponseEntity.ok(gameService.getUserGamesByType(userId, gameType));
    }

    /**
     * Get unclaimed rewards
     */
    @GetMapping("/users/{userId}/rewards/unclaimed")
    public ResponseEntity<List<GameSessionDTO>> getUnclaimedRewards(@PathVariable UUID userId) {
        return ResponseEntity.ok(gameService.getUnclaimedRewards(userId));
    }

    /**
     * Claim reward from a game session
     */
    @PostMapping("/sessions/{sessionId}/claim-reward")
    @PreAuthorize("@userSecurity.isAuthenticated()")
    public ResponseEntity<GameSessionDTO> claimReward(
            @PathVariable UUID sessionId,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(gameService.claimReward(sessionId, userId));
    }
}