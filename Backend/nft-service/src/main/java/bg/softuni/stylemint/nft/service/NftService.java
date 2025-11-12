// NftService.java
package bg.softuni.stylemint.nft.service;

import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.service.TransactionService;
import bg.softuni.stylemint.external.dto.nft.*;
import bg.softuni.stylemint.nft.model.PseudoToken;
import bg.softuni.stylemint.nft.repository.PseudoTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NftService {

    private final PseudoTokenRepository tokenRepository;
    private final TransactionService transactionService;

    public NftBadgeResponse mintBadge(NftBadgeRequest request) {
        System.out.println("=== MINT BADGE REQUEST ===");
        System.out.println("OwnerId: " + request.getOwnerId());
        System.out.println("Name: " + request.getName());
        System.out.println("Description: " + request.getDescription());
        System.out.println("Metadata: " + request.getMetadata());

        // Create pseudo token
        PseudoToken token = new PseudoToken();
        token.setOwnerId(request.getOwnerId());
        token.setName(request.getName() != null ? request.getName() : "Unnamed Badge"); // Default name
        token.setDescription(request.getDescription());
        token.setTokenType("BADGE");
        token.setMetadata(request.getMetadata());
        token.setIsTransferable(request.getIsTransferable() != null ? request.getIsTransferable() : true);

        System.out.println("Token before save: " + token);

        PseudoToken savedToken = tokenRepository.save(token);

        System.out.println("Token after save: " + savedToken);
        // Create blockchain transaction
        Transaction transaction = new Transaction();
        transaction.setToUserId(request.getOwnerId());
        transaction.setTokenId(savedToken.getTokenId().toString());
        transaction.setTokenType("BADGE");
        transaction.setMetadata("MINT: " + request.getName());

        transactionService.processTransaction(transaction);

        // Build response
        NftBadgeResponse response = new NftBadgeResponse();
        response.setTokenId(savedToken.getTokenId());
        response.setTransactionId(transaction.getTransactionId());
        response.setStatus("MINTED");

        return response;
    }

    public UserBadgesResponse getUserBadges(UUID userId) {
        List<PseudoToken> badges = tokenRepository.findByOwnerIdAndTokenType(userId, "BADGE");

        UserBadgesResponse response = new UserBadgesResponse();
        response.setUserId(userId);
        response.setBadges(badges.stream()
                .map(this::mapToBadgeInfo)
                .collect(Collectors.toList()));

        return response;
    }

    public AchievementResponse unlockAchievement(AchievementRequest request) {
        // Similar to mintBadge but for achievements
        PseudoToken achievement = new PseudoToken();
        achievement.setOwnerId(request.getUserId());
        achievement.setName(request.getAchievementName());
        achievement.setDescription(request.getDescription());
        achievement.setTokenType("ACHIEVEMENT");
        achievement.setMetadata(request.getMetadata());
        achievement.setIsTransferable(false);

        PseudoToken savedAchievement = tokenRepository.save(achievement);

        Transaction transaction = new Transaction();
        transaction.setToUserId(request.getUserId());
        transaction.setTokenId(savedAchievement.getTokenId().toString());
        transaction.setTokenType("ACHIEVEMENT");
        transaction.setMetadata("UNLOCK: " + request.getAchievementName());

        transactionService.processTransaction(transaction);

        AchievementResponse response = new AchievementResponse();
        response.setAchievementId(savedAchievement.getTokenId());
        response.setTransactionId(transaction.getTransactionId());
        response.setStatus("UNLOCKED");

        return response;
    }

    public UserAssetsResponse getUserAssets(UUID userId) {
        List<PseudoToken> assets = tokenRepository.findByOwnerId(userId);

        UserAssetsResponse response = new UserAssetsResponse();
        response.setUserId(userId);
        response.setAssets(assets.stream()
                .map(this::mapToAssetInfo)
                .collect(Collectors.toList()));

        return response;
    }

    public TransferResponse transferAsset(TransferRequest request) {
        // Find the token
        PseudoToken token = tokenRepository.findByTokenId(request.getTokenId())
                .orElseThrow(() -> new RuntimeException("Token not found"));

        // Verify ownership
        if (!token.getOwnerId().equals(request.getFromUserId())) {
            throw new RuntimeException("User does not own this token");
        }

        // Update ownership
        token.setOwnerId(request.getToUserId());
        tokenRepository.save(token);

        // Create transfer transaction
        Transaction transaction = new Transaction();
        transaction.setFromUserId(request.getFromUserId());
        transaction.setToUserId(request.getToUserId());
        transaction.setTokenId(token.getTokenId().toString());
        transaction.setTokenType(token.getTokenType());
        transaction.setMetadata("TRANSFER: " + token.getName());

        transactionService.processTransaction(transaction);

        TransferResponse response = new TransferResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setStatus("TRANSFERRED");

        return response;
    }

    private UserBadgesResponse.BadgeInfo mapToBadgeInfo(PseudoToken token) {
        UserBadgesResponse.BadgeInfo badgeInfo = new UserBadgesResponse.BadgeInfo();
        badgeInfo.setTokenId(token.getTokenId());
        badgeInfo.setName(token.getName());
        badgeInfo.setDescription(token.getDescription());
        badgeInfo.setMetadata(token.getMetadata());
        badgeInfo.setCreatedAt(token.getCreatedAt());
        return badgeInfo;
    }

    private UserAssetsResponse.AssetInfo mapToAssetInfo(PseudoToken token) {
        UserAssetsResponse.AssetInfo assetInfo = new UserAssetsResponse.AssetInfo();
        assetInfo.setTokenId(token.getTokenId());
        assetInfo.setName(token.getName());
        assetInfo.setTokenType(token.getTokenType());
        assetInfo.setMetadata(token.getMetadata());
        assetInfo.setCreatedAt(token.getCreatedAt());
        return assetInfo;
    }
}