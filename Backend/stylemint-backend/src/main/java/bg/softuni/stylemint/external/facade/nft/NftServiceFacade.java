// NftServiceFacade.java - FINAL VERSION
package bg.softuni.stylemint.external.facade.nft;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.external.client.nft.NftServiceClient;
import bg.softuni.stylemint.game.enums.RewardType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NftServiceFacade {

    private final NftServiceClient nftServiceClient;

    /**
     * Mint NFT for user
     */
    public MintNftResponse mintNft(UUID ownerId, NftType nftType) {
        log.debug("Minting NFT for user: {}, type: {}", ownerId, nftType);

        try {
            MintNftRequest request = new MintNftRequest();
            request.setOwnerId(ownerId);
            request.setNftType(nftType);

            MintNftResponse response = nftServiceClient.mintNft(request);
            log.info("✅ Successfully minted NFT for user: {}, tokenId: {}", ownerId, response.getTokenId());
            return response;

        } catch (Exception e) {
            log.error("❌ Failed to mint NFT for user: {}, error: {}", ownerId, e.getMessage(), e);
            throw new NftServiceException("Failed to mint NFT", e);
        }
    }

    /**
     * Get all NFTs for user
     */
    public UserNftsResponse getUserNfts(UUID userId) {
        log.debug("Retrieving NFTs for user: {}", userId);

        try {
            UserNftsResponse response = nftServiceClient.getUserNfts(userId);
            log.debug("Retrieved {} NFTs for user: {}", response.getNfts().size(), userId);
            return response;

        } catch (Exception e) {
            log.error("Failed to retrieve NFTs for user: {}, error: {}", userId, e.getMessage());
            throw new NftServiceException("Failed to retrieve user NFTs", e);
        }
    }

    /**
     * Transfer NFT between users
     */
    public TransferNftResponse transferNft(UUID tokenId, UUID fromUserId, UUID toUserId) {
        log.debug("Transferring NFT from user: {} to user: {}, tokenId: {}", fromUserId, toUserId, tokenId);

        try {
            TransferNftRequest request = new TransferNftRequest();
            request.setTokenId(tokenId);
            request.setFromUserId(fromUserId);
            request.setToUserId(toUserId);

            TransferNftResponse response = nftServiceClient.transferNft(request);
            log.info("✅ NFT transferred successfully");
            return response;

        } catch (Exception e) {
            log.error("❌ Failed to transfer NFT, error: {}", e.getMessage(), e);
            throw new NftServiceException("Failed to transfer NFT", e);
        }
    }

    /**
     * Download badge certificate PDF
     */
    public byte[] downloadBadgeCertificate(UUID tokenId, String ownerName) {
        log.debug("Downloading badge certificate for tokenId: {}, owner: {}", tokenId, ownerName);

        try {
            byte[] pdfBytes = nftServiceClient.downloadBadgeCertificate(tokenId, ownerName);
            log.info("✅ Certificate downloaded successfully for tokenId: {}", tokenId);
            return pdfBytes;

        } catch (Exception e) {
            log.error("❌ Failed to download certificate for tokenId: {}, error: {}", tokenId, e.getMessage());
            throw new NftServiceException("Failed to download badge certificate", e);
        }
    }

    /**
     * Convert RewardType to NftType enum (1:1 mapping with shared library)
     */
    public NftType mapRewardTypeToNftType(RewardType rewardType) {
        return switch (rewardType) {
            case NFT_DISCOUNT_5 -> NftType.NFT_DISCOUNT_5;
            case NFT_DISCOUNT_7 -> NftType.NFT_DISCOUNT_7;
            case AUTHOR_BADGE_PRODUCER -> NftType.AUTHOR_BADGE_PRODUCER;
            case AUTHOR_BADGE_DESIGNER -> NftType.AUTHOR_BADGE_DESIGNER;
            default -> null; // Not an NFT reward (DISCOUNT_20, DISCOUNT_40)
        };
    }

    /**
     * Check if reward type is NFT
     */
    public boolean isNftReward(RewardType rewardType) {
        return rewardType != null && (
                rewardType == RewardType.NFT_DISCOUNT_5 ||
                        rewardType == RewardType.NFT_DISCOUNT_7 ||
                        rewardType == RewardType.AUTHOR_BADGE_PRODUCER ||
                        rewardType == RewardType.AUTHOR_BADGE_DESIGNER
        );
    }
}