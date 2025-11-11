// NftServiceClient.java
package bg.softuni.stylemint.external.client.nft;

import bg.softuni.stylemint.external.dto.nft.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "nft-service", url = "${app.services.nft.url}")
public interface NftServiceClient {

    @PostMapping("/api/nft/badges/mint")
    NftBadgeResponse mintBadge(@RequestBody NftBadgeRequest request);

    @GetMapping("/api/nft/badges/user/{userId}")
    UserBadgesResponse getUserBadges(@PathVariable UUID userId);

    @PostMapping("/api/nft/badges/achievement/unlock")
    AchievementResponse unlockAchievement(@RequestBody AchievementRequest request);

    @GetMapping("/api/nft/assets/user/{userId}")
    UserAssetsResponse getUserAssets(@PathVariable UUID userId);

    @PostMapping("/api/nft/assets/transfer")
    TransferResponse transferAsset(@RequestBody TransferRequest request);
}