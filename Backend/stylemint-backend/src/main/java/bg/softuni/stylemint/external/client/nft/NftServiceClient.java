// NftServiceClient.java - SIMPLIFIED VERSION
package bg.softuni.stylemint.external.client.nft;

import bg.softuni.dtos.nft.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "nft-service", url = "${app.services.nft.url}")
public interface NftServiceClient {

    @PostMapping("/api/nft/mint")
    MintNftResponse mintNft(@RequestBody MintNftRequest request);

    @GetMapping("/api/nft/user/{userId}")
    UserNftsResponse getUserNfts(@PathVariable("userId") UUID userId);

    @PostMapping("/api/nft/transfer")
    TransferNftResponse transferNft(@RequestBody TransferNftRequest request);

    @GetMapping("/api/nft/badge/certificate/{tokenId}")
    byte[] downloadBadgeCertificate(
            @PathVariable("tokenId") UUID tokenId,
            @RequestParam("ownerName") String ownerName
    );
}