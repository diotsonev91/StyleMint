package bg.softuni.stylemint.external.dto.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class TransferResponse {
    private UUID transactionId;
    private String status;
    private String message;
}