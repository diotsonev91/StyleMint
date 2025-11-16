package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferRequest {
    private UUID tokenId;
    private UUID fromUserId;
    private UUID toUserId;
    private String metadata;
}