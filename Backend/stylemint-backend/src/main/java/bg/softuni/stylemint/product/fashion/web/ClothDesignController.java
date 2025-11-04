package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/designs")
@RequiredArgsConstructor
public class ClothDesignController {

    private final ClothDesignService clothDesignService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DesignSummaryDTO> createDesign(
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        DesignSummaryDTO design = clothDesignService.createDesign(userId, request);
        return ResponseEntity.ok(design);
    }

    @PutMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DesignSummaryDTO> updateDesign(
            @PathVariable UUID designId,
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        DesignSummaryDTO design = clothDesignService.updateDesign(designId, userId, request);
        return ResponseEntity.ok(design);
    }

    @DeleteMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteDesign(@PathVariable UUID designId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        clothDesignService.deleteDesign(designId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{designId}")
    public ResponseEntity<DesignSummaryDTO> getDesign(@PathVariable UUID designId) {
        DesignSummaryDTO design = clothDesignService.getDesignById(designId);
        return ResponseEntity.ok(design);
    }

    @GetMapping("/my-designs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DesignSummaryDTO>> getMyDesigns() {
        UUID userId = SecurityUtil.getCurrentUserId();
        List<DesignSummaryDTO> designs = clothDesignService.getUserDesigns(userId);
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/public")
    public ResponseEntity<Page<DesignSummaryDTO>> getPublicDesigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DesignSummaryDTO> designs = clothDesignService.getPublicDesigns(pageable);
        return ResponseEntity.ok(designs);
    }

    /**
     * Get the designer summary for the currently authenticated user
     */
    @GetMapping("/user/me/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDesignerSummaryDTO> getMyDesignerSummary() {
        UUID userId = SecurityUtil.getCurrentUserId();
        UserDesignerSummaryDTO summary = clothDesignService.getUserDesignerSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get designer summary for a specific user (Admin only or remove if not needed)
     */
    @GetMapping("/user/{userId}/summary")
    @PreAuthorize("hasRole('ADMIN')") // Or remove this endpoint entirely
    public ResponseEntity<UserDesignerSummaryDTO> getDesignerSummary(@PathVariable UUID userId) {
        UserDesignerSummaryDTO summary = clothDesignService.getUserDesignerSummary(userId);
        return ResponseEntity.ok(summary);
    }
}