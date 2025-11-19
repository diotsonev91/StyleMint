package bg.softuni.dtos.nft;


import bg.softuni.dtos.enums.nft.NftType;
import lombok.Data;
import java.util.UUID;

@Data
public class BadgeCertificateResponse {
    private String ownerName;
    private NftType badgeType;
    private String dateIssued;
    private String nftHash;
    private String description;
    private UUID tokenId;
}
