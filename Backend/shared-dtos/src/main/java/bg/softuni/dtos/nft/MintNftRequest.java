package bg.softuni.dtos.nft;


import bg.softuni.dtos.enums.nft.NftType;
import lombok.Data;
import java.util.UUID;

@Data
public class MintNftRequest {
    private UUID ownerId;
    private NftType nftType;
}
