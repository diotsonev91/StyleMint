package bg.softuni.stylemint.external.dto.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class AchievementResponse {
    private UUID achievementId;
    private UUID transactionId;
    private String status;
    private String message;
}