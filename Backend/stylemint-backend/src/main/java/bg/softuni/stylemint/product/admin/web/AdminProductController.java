package bg.softuni.stylemint.product.admin.web;

import bg.softuni.stylemint.product.admin.dto.AdminClothDesignDTO;
import bg.softuni.stylemint.product.admin.dto.AdminPackDTO;
import bg.softuni.stylemint.product.admin.dto.AdminSampleDTO;
import bg.softuni.stylemint.product.admin.service.AdminProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping("/designs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminClothDesignDTO>> getPublishedDesigns(Pageable pageable) {
        return ResponseEntity.ok(adminProductService.getAllClothDesigns(pageable));
    }

    @GetMapping("/samples")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminSampleDTO>> getSamples(Pageable pageable) {
        return ResponseEntity.ok(adminProductService.getAllSamples(pageable));
    }

    @GetMapping("/packs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminPackDTO>> getPacks(Pageable pageable) {
        return ResponseEntity.ok(adminProductService.getAllPacks(pageable));
    }


    /**
     * Delete ANY cloth design.
     */
    @DeleteMapping("/designs/{designId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDesignAsAdmin(@PathVariable UUID designId) {
        adminProductService.adminDeleteDesign(designId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Archive ANY sample.
     */
    @DeleteMapping("/samples/{sampleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archiveSampleAsAdmin(@PathVariable UUID sampleId) {
        adminProductService.adminArchiveSample(sampleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Archive ANY pack.
     */
    @DeleteMapping("/packs/{packId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archivePackAsAdmin(@PathVariable UUID packId) {
        adminProductService.adminArchivePack(packId);
        return ResponseEntity.noContent().build();
    }
}
