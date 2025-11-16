package bg.softuni.dtos.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferResponse {
    private UUID transactionId;
    private String status;
    private String message;
}