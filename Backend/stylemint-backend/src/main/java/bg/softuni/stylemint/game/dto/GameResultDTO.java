package bg.softuni.stylemint.game.dto;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for submitting game results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResultDTO {

    @NotNull(message = "Game type is required")
    private GameType gameType;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be non-negative")
    private Integer score;

    /**
     * Duration in seconds (optional)
     */
    @Min(value = 0, message = "Duration must be non-negative")
    private Integer durationSeconds;

    /**
     * Reward earned (if any)
     */
    private RewardType rewardType;

    /**
     * Additional game metadata (optional)
     */
    private String metadata;
}