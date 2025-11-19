package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferNftRequest {
    private UUID tokenId;
    private UUID fromUserId;
    private UUID toUserId;
}
