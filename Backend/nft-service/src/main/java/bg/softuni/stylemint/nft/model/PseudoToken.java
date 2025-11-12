// PseudoToken.java
package bg.softuni.stylemint.nft.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.UUID;

@Data
@Document(collection = "tokens")
public class PseudoToken {
    @Id
    private String id;
    private UUID tokenId;
    private UUID ownerId;
    private String name;
    private String description;
    private String imageUrl;
    private String tokenType; // "BADGE", "ACHIEVEMENT", "ASSET"
    private String metadata;
    private Long createdAt;
    private Boolean isTransferable;
    private String contractAddress;

    public PseudoToken() {
        this.tokenId = UUID.randomUUID();
        this.createdAt = System.currentTimeMillis();
    }
}