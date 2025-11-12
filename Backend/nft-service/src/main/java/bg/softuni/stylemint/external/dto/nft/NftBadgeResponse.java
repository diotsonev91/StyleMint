package bg.softuni.stylemint.external.dto.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class NftBadgeResponse {
    private UUID tokenId;
    private UUID transactionId;
    private String status;
    private String message;
}