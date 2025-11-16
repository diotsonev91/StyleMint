package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class UserBadgesResponse {
    private UUID userId;
    private List<BadgeInfo> badges;

    @Data
    public static class BadgeInfo {
        private UUID tokenId;
        private String name;
        private String description;
        private String metadata;
        private Long createdAt;
    }
}