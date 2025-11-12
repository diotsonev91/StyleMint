package bg.softuni.stylemint.external.dto.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferRequest {
    private UUID tokenId;
    private UUID fromUserId;
    private UUID toUserId;
    private String metadata;
}