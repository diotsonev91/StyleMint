// NftController.java
package bg.softuni.stylemint.nft.controller;

import bg.softuni.stylemint.external.dto.nft.*;
import bg.softuni.stylemint.nft.service.NftService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/nft")
@RequiredArgsConstructor
public class NftController {

    private final NftService nftService;

    @PostMapping("/badges/mint")
    public NftBadgeResponse mintBadge(@RequestBody NftBadgeRequest request) {
        return nftService.mintBadge(request);
    }

    @GetMapping("/badges/user/{userId}")
    public UserBadgesResponse getUserBadges(@PathVariable UUID userId) {
        return nftService.getUserBadges(userId);
    }

    @PostMapping("/badges/achievement/unlock")
    public AchievementResponse unlockAchievement(@RequestBody AchievementRequest request) {
        return nftService.unlockAchievement(request);
    }

    @GetMapping("/assets/user/{userId}")
    public UserAssetsResponse getUserAssets(@PathVariable UUID userId) {
        return nftService.getUserAssets(userId);
    }

    @PostMapping("/assets/transfer")
    public TransferResponse transferAsset(@RequestBody TransferRequest request) {
        return nftService.transferAsset(request);
    }
}