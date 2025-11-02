package bg.softuni.stylemint.game.dto;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGameSummaryDTO {
    private int totalScore;
    private int gamesPlayed;
    private Set<GameType> gameTypes;
    private int unclaimedRewards;
    private OffsetDateTime lastPlayedAt;
    private RewardType lastRewardType;
}
