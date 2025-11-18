package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ApiResponse<DesignSummaryDTO>> createDesign(
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        DesignSummaryDTO design = clothDesignService.createDesign(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(design, "Design created successfully"));
    }

    @PutMapping("/{designId}")
    public ResponseEntity<ApiResponse<DesignSummaryDTO>> updateDesign(
            @PathVariable UUID designId,
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        DesignSummaryDTO design = clothDesignService.updateDesign(designId, userId, request);
        return ResponseEntity.ok(ApiResponse.success(design, "Design updated successfully"));
    }

    @DeleteMapping("/{designId}")
    public ResponseEntity<ApiResponse<Void>> deleteDesign(@PathVariable UUID designId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        clothDesignService.deleteDesign(designId, userId);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.successMessage("Design deleted successfully"));
    }

    @GetMapping("/{designId}")
    public ResponseEntity<ApiResponse<DesignDetailDTO>> getDesign(@PathVariable UUID designId) {
        DesignDetailDTO design = clothDesignService.getDesignById(designId);
        return ResponseEntity.ok(ApiResponse.success(design));
    }

    @GetMapping("/my-designs")
    public ResponseEntity<ApiResponse<List<DesignDetailDTO>>> getMyDesigns() {
        UUID userId = SecurityUtil.getCurrentUserId();
        List<DesignDetailDTO> designs = clothDesignService.getUserDesigns(userId);
        return ResponseEntity.ok(ApiResponse.success(designs));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Page<DesignSummaryDTO>>> getPublicDesigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DesignSummaryDTO> designs = clothDesignService.getPublicDesigns(pageable);
        return ResponseEntity.ok(ApiResponse.success(designs));
    }

    @GetMapping("/user/me/summary")
    public ResponseEntity<ApiResponse<UserDesignerSummaryDTO>> getMyDesignerSummary() {
        UUID userId = SecurityUtil.getCurrentUserId();
        UserDesignerSummaryDTO summary = clothDesignService.getUserDesignerSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/user/{userId}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDesignerSummaryDTO>> getDesignerSummary(@PathVariable UUID userId) {
        UserDesignerSummaryDTO summary = clothDesignService.getUserDesignerSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}