package bg.softuni.stylemint.game.dto;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO representing a game session
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionDTO {
    private UUID id;
    private UUID userId;
    private GameType gameType;
    private Integer score;
    private Integer durationSeconds;
    private RewardType rewardType;
    private Boolean rewardClaimed;
    private OffsetDateTime playedAt;
    private String metadata;
}