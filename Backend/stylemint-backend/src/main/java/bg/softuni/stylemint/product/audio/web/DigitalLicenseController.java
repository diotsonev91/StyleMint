package bg.softuni.stylemint.product.audio.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.audio.service.DigitalLicenseService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/licenses")
@RequiredArgsConstructor
public class DigitalLicenseController {

    private final DigitalLicenseService digitalLicenseService;

    @DeleteMapping("/samples/{sampleId}")
    public ResponseEntity<Void> deleteSampleLicense(
            @PathVariable UUID sampleId
    ) {
        UUID userId = SecurityUtil.getCurrentUserId();
        digitalLicenseService.deleteSampleLicense(userId, sampleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/packs/{packId}")
    public ResponseEntity<Void> deletePackLicense(
            @PathVariable UUID packId
    ) {
        UUID userId = SecurityUtil.getCurrentUserId();
        digitalLicenseService.deletePackLicense(userId, packId);
        return ResponseEntity.noContent().build();
    }
}
