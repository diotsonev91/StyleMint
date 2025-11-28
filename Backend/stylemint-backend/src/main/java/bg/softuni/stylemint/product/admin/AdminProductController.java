package bg.softuni.stylemint.product.admin;

import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ClothDesignService clothDesignService;
    private final AudioSampleService audioSampleService;
    private final SamplePackService samplePackService;

    /**
     * Delete ANY cloth design.
     */
    @DeleteMapping("/designs/{designId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDesignAsAdmin(@PathVariable UUID designId) {
        clothDesignService.adminDeleteDesign(designId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Archive ANY sample.
     */
    @DeleteMapping("/samples/{sampleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archiveSampleAsAdmin(@PathVariable UUID sampleId) {
        audioSampleService.adminArchiveSample(sampleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Archive ANY pack.
     */
    @DeleteMapping("/packs/{packId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archivePackAsAdmin(@PathVariable UUID packId) {
        samplePackService.adminArchivePack(packId);
        return ResponseEntity.noContent().build();
    }
}
