// Block.java
package bg.softuni.stylemint.blockchain.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "blocks")
public class Block {
    @Id
    private String id;
    private Long index;
    private Long timestamp;
    private String previousHash;
    private String hash;
    private Integer nonce;
    private List<Transaction> transactions;
    private Integer difficulty;

    public Block() {
        this.timestamp = System.currentTimeMillis();
    }
}