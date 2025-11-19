package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferNftResponse {
    private UUID transactionId;
    private String message;
}
