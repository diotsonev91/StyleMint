package bg.softuni.stylemint.external.service.nft;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.*;
import java.util.UUID;

public interface NftProxyService {

    /**
     * Get all NFTs for a user
     * @param userId the UUID of the user
     * @return UserNftsResponse containing all user's NFTs
     */
    UserNftsResponse getUserNfts(UUID userId);

    /**
     * Download badge certificate PDF for an NFT
     * @param tokenId the UUID of the NFT token
     * @param userId the UUID of the user requesting the certificate
     * @return byte array containing the PDF certificate
     */
    byte[] downloadBadgeCertificate(UUID tokenId, UUID userId);

    /**
     * Transfer NFT from one user to another
     * @param tokenId the UUID of the NFT token
     * @param fromUserId the UUID of the current owner
     * @param toUserId the UUID of the new owner
     * @return TransferNftResponse with transaction details
     */
    TransferNftResponse transferNft(UUID tokenId, UUID fromUserId, UUID toUserId);

    /**
     * Mint a new NFT for a user
     * @param ownerId the UUID of the NFT owner
     * @param nftType the type of NFT to mint
     * @return MintNftResponse with minting details
     */
    MintNftResponse mintNft(UUID ownerId, bg.softuni.dtos.enums.nft.NftType nftType);

    /**
     * Convert RewardType to NftType enum
     */
    NftType mapRewardTypeToNftType(bg.softuni.stylemint.game.enums.RewardType rewardType);
}