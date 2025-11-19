package bg.softuni.stylemint.nft.model;

import bg.softuni.dtos.enums.nft.NftType;
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
    private NftType nftType;
    private Long createdAt;

    public PseudoToken() {
        this.tokenId = UUID.randomUUID();
        this.createdAt = System.currentTimeMillis();
    }

    public boolean isTransferable() {
        return nftType != null && nftType.isTransferable();
    }
}