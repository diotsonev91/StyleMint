package bg.softuni.stylemint.blockchain.model;

import bg.softuni.dtos.enums.nft.NftType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.UUID;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private UUID transactionId;
    private UUID fromUserId;  // null for minting
    private UUID toUserId;
    private String tokenId;
    private NftType nftType;
    private TransactionType transactionType;
    private Long timestamp;
    private String blockHash;
    private TransactionStatus status;

    public Transaction() {
        this.transactionId = UUID.randomUUID();
        this.timestamp = System.currentTimeMillis();
        this.status = TransactionStatus.PENDING;
    }

    public enum TransactionStatus {
        PENDING,
        CONFIRMED,
        FAILED
    }

    public enum TransactionType {
        MINT,
        TRANSFER
    }
}