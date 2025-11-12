package bg.softuni.stylemint.external.dto.nft;

import lombok.Data;
import java.util.UUID;

@Data
public class NftBadgeRequest {
    private UUID ownerId;
    private String name;
    private String description;
    private String metadata;
    private Boolean isTransferable;
}