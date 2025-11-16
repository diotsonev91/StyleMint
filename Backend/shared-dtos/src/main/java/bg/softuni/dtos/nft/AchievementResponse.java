package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class AchievementResponse {
    private UUID achievementId;
    private UUID transactionId;
    private String status;
    private String message;
}