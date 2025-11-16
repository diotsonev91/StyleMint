package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class UserAssetsResponse {
    private UUID userId;
    private List<AssetInfo> assets;

    @Data
    public static class AssetInfo {
        private UUID tokenId;
        private String name;
        private String tokenType;
        private String metadata;
        private Long createdAt;
    }
}