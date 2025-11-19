package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class MintNftResponse {
    private UUID tokenId;
    private UUID transactionId;
    private String message;
}
