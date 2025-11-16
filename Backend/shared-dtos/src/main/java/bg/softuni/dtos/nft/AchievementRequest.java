package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class AchievementRequest {
    private UUID userId;
    private String achievementName;
    private String description;
    private String metadata;
}