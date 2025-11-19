package bg.softuni.dtos.nft;

import bg.softuni.dtos.enums.nft.NftType;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class UserNftsResponse {
    private UUID userId;
    private List<NftInfo> nfts;

    @Data
    public static class NftInfo {
        private UUID tokenId;
        private NftType nftType;
        private Boolean isTransferable;
        private Long createdAt;
    }
}
