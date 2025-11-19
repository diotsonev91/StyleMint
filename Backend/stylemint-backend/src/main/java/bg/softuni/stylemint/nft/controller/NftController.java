
package bg.softuni.stylemint.nft.controller;

import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/nft")
@RequiredArgsConstructor
public class NftController {

    private final NftServiceFacade nftServiceFacade;
    private final UserService userService;

    /**
     * Get user's NFTs
     * Simple proxy to NFT microservice
     */
    @GetMapping("/my-nfts")
    public ResponseEntity<ApiResponse<UserNftsResponse>> getMyNfts() {
        UUID userId = SecurityUtil.getCurrentUserId();

        log.debug("Fetching NFTs for user: {}", userId);
        UserNftsResponse response = nftServiceFacade.getUserNfts(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Download certificate PDF
     * Simple proxy - frontend clicks "Download Certificate"
     */
    @GetMapping("/certificate/{tokenId}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable UUID tokenId) {

        UUID userId = SecurityUtil.getCurrentUserId();
        UserDTO user = userService.findById(userId);
        String ownerName = user.getDisplayName();

        log.info("User {} requesting certificate for tokenId: {}", ownerName, tokenId);

        try {
            // Just proxy to NFT microservice - no storage
            byte[] pdfBytes = nftServiceFacade.downloadBadgeCertificate(tokenId, ownerName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    String.format("badge-certificate-%s.pdf", tokenId));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (Exception e) {
            log.error("Failed to download certificate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Transfer NFT
     */
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferNftResponse>> transferNft(
            @RequestParam UUID tokenId,
            @RequestParam UUID toUserId) {

        UUID fromUserId = SecurityUtil.getCurrentUserId();

        log.info("Transferring NFT {} from {} to {}", tokenId, fromUserId, toUserId);
        TransferNftResponse response = nftServiceFacade.transferNft(tokenId, fromUserId, toUserId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}