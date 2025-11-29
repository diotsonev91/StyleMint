package bg.softuni.stylemint.product.audio.web;

import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.product.audio.service.DigitalLicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/licenses")
@RequiredArgsConstructor
public class DigitalLicenseController {

    private final DigitalLicenseService digitalLicenseService;

    @DeleteMapping("/samples/{sampleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteSampleLicense(
            @PathVariable UUID sampleId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        digitalLicenseService.deleteSampleLicense(userId, sampleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/packs/{packId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePackLicense(
            @PathVariable UUID packId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        digitalLicenseService.deletePackLicense(userId, packId);
        return ResponseEntity.noContent().build();
    }
}