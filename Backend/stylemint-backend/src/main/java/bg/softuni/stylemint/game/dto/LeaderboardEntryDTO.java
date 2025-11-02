package bg.softuni.stylemint.game.dto;

import bg.softuni.stylemint.game.enums.GameType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private GameType gameType;
    private UUID userId;
    private String displayName;
    private String avatarUrl;
    private int totalScore;
    private int rank;
}