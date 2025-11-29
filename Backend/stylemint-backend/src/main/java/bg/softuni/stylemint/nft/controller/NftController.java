package bg.softuni.stylemint.nft.controller;

import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@Slf4j
@RestController
@RequestMapping(BASE + "/nft")
@RequiredArgsConstructor
public class NftController {

    private final NftServiceFacade nftServiceFacade;
    private final UserService userService;

    /**
     * Get user's NFTs
     */
    @GetMapping("/my-nfts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserNftsResponse>> getMyNfts(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        log.debug("Fetching NFTs for user {}", userId);

        UserNftsResponse response = nftServiceFacade.getUserNfts(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Download NFT badge certificate (PDF)
     */
    @GetMapping("/certificate/{tokenId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable UUID tokenId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        UserDTO user = userService.findById(userId);
        String ownerName = user.getDisplayName();

        log.info("User {} requesting certificate for tokenId {}", ownerName, tokenId);

        byte[] pdf = nftServiceFacade.downloadBadgeCertificate(tokenId, ownerName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
                "attachment",
                String.format("badge-certificate-%s.pdf", tokenId)
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }

    /**
     * Transfer NFT to another user
     */
    @PostMapping("/transfer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TransferNftResponse>> transferNft(
            @RequestParam UUID tokenId,
            @RequestParam UUID toUserId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID fromUserId = userDetails.getUserId();
        log.info("Transferring NFT {} from {} to {}", tokenId, fromUserId, toUserId);

        TransferNftResponse response = nftServiceFacade.transferNft(
                tokenId, fromUserId, toUserId
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}