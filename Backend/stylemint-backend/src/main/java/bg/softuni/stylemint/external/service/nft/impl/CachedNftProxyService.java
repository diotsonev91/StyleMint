// CachedNftProxyService.java
package bg.softuni.stylemint.external.service.nft.impl;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.external.service.nft.NftProxyService;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.service.UserService;
import com.github.benmanes.caffeine.cache.Cache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CachedNftProxyService implements NftProxyService {

    private final NftServiceFacade nftServiceFacade;
    private final UserService userService;

    private final Cache<UUID, UserNftsResponse> userNftsCache;
    private final Cache<UUID, byte[]> certificateCache;

    @Override
    public UserNftsResponse getUserNfts(UUID userId) {
        log.debug("CachedNftProxyService: Fetching NFTs for user {}", userId);
        validateUserId(userId);

        UserNftsResponse cached = userNftsCache.getIfPresent(userId);
        if (cached != null) {
            log.debug("✅ Cache HIT for user {}", userId);
            return cached;
        }

        log.debug("❌ Cache MISS for user {}, fetching from NFT service...", userId);
        UserNftsResponse response = nftServiceFacade.getUserNfts(userId);

        if (response != null) {
            userNftsCache.put(userId, response);
            log.debug("📥 Cached response for user {}", userId);
        }

        return response;
    }

    @Override
    public byte[] downloadBadgeCertificate(UUID tokenId, UUID userId) {
        log.debug("CachedNftProxyService: Downloading certificate for tokenId {}, user {}", tokenId, userId);
        validateUserId(userId);

        byte[] cached = certificateCache.getIfPresent(tokenId);
        if (cached != null) {
            log.debug("✅ Cache HIT for certificate {}", tokenId);
            return cached;
        }

        log.debug("❌ Cache MISS for certificate {}, generating...", tokenId);

        UserDTO user = userService.findById(userId);
        String ownerName = user.getDisplayName();

        byte[] pdf = nftServiceFacade.downloadBadgeCertificate(tokenId, ownerName);

        if (pdf != null && pdf.length > 0) {
            certificateCache.put(tokenId, pdf);
            log.debug("📥 Cached PDF for token {}", tokenId);
        }

        return pdf;
    }

    @Override
    public TransferNftResponse transferNft(UUID tokenId, UUID fromUserId, UUID toUserId) {
        log.debug("CachedNftProxyService: Transferring NFT {} from {} to {}", tokenId, fromUserId, toUserId);

        validateUserId(fromUserId);
        validateUserId(toUserId);
        validateNotSelfTransfer(fromUserId, toUserId);

        TransferNftResponse response = nftServiceFacade.transferNft(tokenId, fromUserId, toUserId);

        userNftsCache.invalidate(fromUserId);
        userNftsCache.invalidate(toUserId);
        log.debug("🔄 Invalidated cache for users {} and {}", fromUserId, toUserId);

        return response;
    }

    @Override
    public MintNftResponse mintNft(UUID ownerId, NftType nftType) {
        log.debug("CachedNftProxyService: Minting NFT for user {}, type {}", ownerId, nftType);

        validateUserId(ownerId);
        validateNftType(nftType);

        MintNftResponse response = nftServiceFacade.mintNft(ownerId, nftType);

        userNftsCache.invalidate(ownerId);
        log.debug("🔄 Invalidated cache for user {}", ownerId);

        return response;
    }

    // ============ PRIVATE HELPER METHODS ============

    private void validateUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
    }

    private void validateNotSelfTransfer(UUID fromUserId, UUID toUserId) {
        if (fromUserId.equals(toUserId)) {
            throw new IllegalArgumentException("Cannot transfer NFT to yourself");
        }
    }

    private void validateNftType(NftType nftType) {
        if (nftType == null) {
            throw new IllegalArgumentException("NFT type cannot be null");
        }
    }

    public String getCacheStats() {
        return String.format(
                "User NFTs Cache: size=%d, stats=%s | Certificate Cache: size=%d, stats=%s",
                userNftsCache.estimatedSize(),
                userNftsCache.stats().toString(),
                certificateCache.estimatedSize(),
                certificateCache.stats().toString()
        );
    }

    @Override
    public NftType mapRewardTypeToNftType(bg.softuni.stylemint.game.enums.RewardType rewardType) {
        return nftServiceFacade.mapRewardTypeToNftType(rewardType);
    }
}