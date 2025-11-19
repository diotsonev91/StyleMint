package bg.softuni.stylemint.nft.controller;

import bg.softuni.dtos.nft.*;
import bg.softuni.stylemint.nft.service.NftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/nft")
@RequiredArgsConstructor
public class NftController {

    private final NftService nftService;

    @PostMapping("/mint")
    public MintNftResponse mintNft(@RequestBody MintNftRequest request) {
        return nftService.mintNft(request);
    }

    @GetMapping("/user/{userId}")
    public UserNftsResponse getUserNfts(@PathVariable UUID userId) {
        return nftService.getUserNfts(userId);
    }

    @PostMapping("/transfer")
    public TransferNftResponse transferNft(@RequestBody TransferNftRequest request) {
        return nftService.transferNft(request);
    }

    @GetMapping("/badge/certificate/{tokenId}")
    public ResponseEntity<byte[]> downloadBadgeCertificate(
            @PathVariable UUID tokenId,
            @RequestParam String ownerName) {

        byte[] pdfBytes = nftService.generateBadgeCertificatePdf(tokenId, ownerName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "badge-certificate.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}