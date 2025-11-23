// NftMintingScheduler.java - FINAL VERSION (no transactionId)
package bg.softuni.stylemint.game.scheduler;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.game.model.GameSession;
import bg.softuni.stylemint.game.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Scheduled job to mint NFTs for claimed game rewards
 * Runs every 5 minutes to process pending NFT rewards
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NftMintingScheduler {

    private final GameRepository gameSessionRepository;
    private final NftServiceFacade nftServiceFacade;


    @Scheduled(fixedDelayString = "${scheduler.nft-minting.delay-ms}")
    @Transactional
    public void processClaimedNftRewards() {
        log.debug("🔄 Starting NFT minting scheduler...");

        try {
            // Find all claimed sessions with NFT rewards that haven't been minted yet
            List<GameSession> pendingNfts = gameSessionRepository.findClaimedNftRewardsNotMinted();

            if (pendingNfts.isEmpty()) {
                log.debug("✅ No pending NFT rewards to mint");
                return;
            }

            log.info("🎨 Found {} pending NFT rewards to mint", pendingNfts.size());

            int successCount = 0;
            int failCount = 0;

            for (GameSession session : pendingNfts) {
                try {
                    mintNftForSession(session);
                    successCount++;
                } catch (Exception e) {
                    log.error("❌ Failed to mint NFT for session: {}, error: {}",
                            session.getId(), e.getMessage(), e);
                    failCount++;
                }
            }

            log.info("✅ NFT minting completed: {} success, {} failed", successCount, failCount);

        } catch (Exception e) {
            log.error("❌ Error in NFT minting scheduler: {}", e.getMessage(), e);
        }
    }

    /**
     * Mint NFT for a single game session
     */
    private void mintNftForSession(GameSession session) {
        log.debug("Minting NFT for session: {}, user: {}, reward: {}",
                session.getId(), session.getUserId(), session.getRewardType());

        // Convert reward type to NftType enum
        NftType nftType = nftServiceFacade.mapRewardTypeToNftType(session.getRewardType());

        if (nftType == null) {
            log.warn("⚠️ Invalid reward type for NFT minting: {}", session.getRewardType());
            return;
        }

        // Mint the NFT
        var response = nftServiceFacade.mintNft(session.getUserId(), nftType);

        // Mark as minted and save ONLY the tokenId reference
        // All other NFT details (transaction, metadata, etc.) are stored in the NFT microservice
        session.setNftMinted(true);
        session.setNftTokenId(response.getTokenId());
        gameSessionRepository.save(session);

        log.info("✅ NFT minted successfully for session: {}, tokenId: {}, message: {}",
                session.getId(), response.getTokenId(), response.getMessage());
    }
}