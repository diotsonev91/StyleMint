package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
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
    public ResponseEntity<ApiResponse<DesignPublicDTO>> createDesign(
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        DesignPublicDTO design = clothDesignService.createDesign(request, false);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(design, "Design created successfully"));
    }

    @PutMapping("/{designId}")
    public ResponseEntity<ApiResponse<DesignPublicDTO>> updateDesign(
            @PathVariable UUID designId,
            @Valid @ModelAttribute DesignUploadRequestDTO request) {
        DesignPublicDTO design = clothDesignService.updateDesign(designId, request);
        return ResponseEntity.ok(ApiResponse.success(design, "Design updated successfully"));
    }

    @DeleteMapping("/{designId}")
    public ResponseEntity<ApiResponse<Void>> deleteDesign(@PathVariable UUID designId) {

        clothDesignService.deleteDesign(designId);
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
    public ResponseEntity<ApiResponse<Page<DesignPublicDTO>>> getPublicDesigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DesignPublicDTO> designs = clothDesignService.getPublicDesigns(pageable);
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

    @GetMapping("/cloth-type/{clothType}")
    public ResponseEntity<ApiResponse<Page<DesignPublicDTO>>> getDesignsByClothType(
            @PathVariable ClothType clothType,  // Path parameter for ClothType
            @RequestParam(defaultValue = "0") int page,  // Pagination parameter for page
            @RequestParam(defaultValue = "20") int size) {  // Pagination parameter for size
        Pageable pageable = PageRequest.of(page, size);  // Create Pageable from parameters

        // Call the service function to get designs by ClothType
        Page<DesignPublicDTO> designs = clothDesignService.getAllByClothType(pageable, clothType);

        return ResponseEntity.ok(ApiResponse.success(designs));  // Return the result wrapped in ApiResponse
    }

    @PostMapping("/auto-save-for-cart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DesignPublicDTO>> autoSaveForCart(
            @ModelAttribute DesignUploadRequestDTO request) {

        UUID userId = SecurityUtil.getCurrentUserId();

        // Set default values for temporary design
        if (request.getLabel() == null || request.getLabel().isBlank()) {
            request.setLabel("My Design " + System.currentTimeMillis());
        }

        if (request.getIsPublic() == null) {
            request.setIsPublic(false);
        }

        if (request.getBonusPoints() == null) {
            request.setBonusPoints(0);
        }

        // Create the design
        DesignPublicDTO savedDesign = clothDesignService.createDesign(request, true);

        return ResponseEntity.ok(ApiResponse.success(
                savedDesign,
                "Design saved for cart"
        ));
    }

}