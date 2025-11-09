package bg.softuni.stylemint.product.audio.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/audio/packs")
@RequiredArgsConstructor
public class SamplePackController {

    private final SamplePackService samplePackService;

    // ================ CRUD Operations ================

    /**
     * Upload a new sample pack with multiple samples
     * POST /api/v1/audio/packs
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SamplePackDTO>> uploadPack(
            @Valid @ModelAttribute UploadPackRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        SamplePackDTO pack = samplePackService.uploadPack(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(pack, "Sample pack uploaded successfully"));
    }

    /**
     * Get pack by ID (basic info)
     * GET /api/v1/audio/packs/{packId}
     */
    @GetMapping("/{packId}")
    public ResponseEntity<SamplePackDTO> getPack(@PathVariable UUID packId) {
        SamplePackDTO pack = samplePackService.getPackById(packId);
        return ResponseEntity.ok(pack);
    }

    /**
     * Get pack with all samples
     * GET /api/v1/audio/packs/{packId}/detail
     */
    @GetMapping("/{packId}/detail")
    public ResponseEntity<SamplePackDetailDTO> getPackWithSamples(@PathVariable UUID packId) {
        SamplePackDetailDTO packDetail = samplePackService.getPackWithSamples(packId);
        return ResponseEntity.ok(packDetail);
    }

    /**
     * Update pack
     * PUT /api/v1/audio/packs/{packId}
     */
    @PutMapping(value = "/{packId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SamplePackDTO>> updatePack(
            @PathVariable UUID packId,
            @Valid @ModelAttribute UpdatePackRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        SamplePackDTO pack = samplePackService.updatePack(packId, authorId, request);
        return ResponseEntity.ok(ApiResponse.success(pack, "Pack updated successfully"));
    }

    /**
     * Delete pack
     * DELETE /api/v1/audio/packs/{packId}
     */
    @DeleteMapping("/{packId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePack(@PathVariable UUID packId) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        samplePackService.deletePack(packId, authorId);
        return ResponseEntity.noContent().build();
    }

    // ================ Listing Operations ================

    /**
     * Get all packs by current user
     * GET /api/v1/audio/packs/my-packs
     */
    @GetMapping("/my-packs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SamplePackDTO>> getMyPacks() {
        UUID authorId = SecurityUtil.getCurrentUserId();
        List<SamplePackDTO> packs = samplePackService.getPacksByAuthor(authorId);
        return ResponseEntity.ok(packs);
    }

    /**
     * Get packs by author ID
     * GET /api/v1/audio/packs/author/{authorId}
     */
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<SamplePackDTO>> getPacksByAuthor(@PathVariable UUID authorId) {
        List<SamplePackDTO> packs = samplePackService.getPacksByAuthor(authorId);
        return ResponseEntity.ok(packs);
    }

    /**
     * Get packs by artist name
     * GET /api/v1/audio/packs/artist/{artist}
     */
    @GetMapping("/artist/{artist}")
    public ResponseEntity<Page<SamplePackDTO>> getPacksByArtist(
            @PathVariable String artist,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SamplePackDTO> packs = samplePackService.getPacksByArtist(artist, pageable);
        return ResponseEntity.ok(packs);
    }

    /**
     * Get packs by genre
     * GET /api/v1/audio/packs/genre/{genre}
     */
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<SamplePackDTO>> getPacksByGenre(@PathVariable Genre genre) {
        List<SamplePackDTO> packs = samplePackService.getPacksByGenre(genre);
        return ResponseEntity.ok(packs);
    }

    /**
     * Get all packs (paginated)
     * GET /api/v1/audio/packs/all
     */
    @GetMapping("/all")
    public ResponseEntity<Page<SamplePackDTO>> getAllPacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<SamplePackDTO> packs = samplePackService.getAllPacks(pageable);
        return ResponseEntity.ok(packs);
    }

    // ================ Search Operations ================

    /**
     * Advanced search with filters
     * POST /api/v1/audio/packs/search
     */
    @PostMapping("/search")
    public ResponseEntity<Page<SamplePackDTO>> searchPacks(
            @RequestBody SamplePackSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SamplePackDTO> packs = samplePackService.searchPacks(request, pageable);
        return ResponseEntity.ok(packs);
    }

    /**
     * Search packs by title
     * GET /api/v1/audio/packs/search/title
     */
    @GetMapping("/search/title")
    public ResponseEntity<List<SamplePackDTO>> searchByTitle(@RequestParam String title) {
        List<SamplePackDTO> packs = samplePackService.searchPacksByTitle(title);
        return ResponseEntity.ok(packs);
    }

    /**
     * Find similar packs
     * GET /api/v1/audio/packs/{packId}/similar
     */
    @GetMapping("/{packId}/similar")
    public ResponseEntity<List<SamplePackDTO>> findSimilarPacks(@PathVariable UUID packId) {
        List<SamplePackDTO> packs = samplePackService.findSimilarPacks(packId);
        return ResponseEntity.ok(packs);
    }

    // ================ Featured/Popular Operations ================

    /**
     * Get top rated packs
     * GET /api/v1/audio/packs/top-rated
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<SamplePackDTO>> getTopRatedPacks() {
        List<SamplePackDTO> packs = samplePackService.getTopRatedPacks();
        return ResponseEntity.ok(packs);
    }

    /**
     * Get most downloaded packs
     * GET /api/v1/audio/packs/most-downloaded
     */
    @GetMapping("/most-downloaded")
    public ResponseEntity<List<SamplePackDTO>> getMostDownloadedPacks() {
        List<SamplePackDTO> packs = samplePackService.getMostDownloadedPacks();
        return ResponseEntity.ok(packs);
    }

    /**
     * Get latest released packs
     * GET /api/v1/audio/packs/latest
     */
    @GetMapping("/latest")
    public ResponseEntity<List<SamplePackDTO>> getLatestPacks() {
        List<SamplePackDTO> packs = samplePackService.getLatestPacks();
        return ResponseEntity.ok(packs);
    }

    /**
     * Get featured packs
     * GET /api/v1/audio/packs/featured
     */
    @GetMapping("/featured")
    public ResponseEntity<Page<SamplePackDTO>> getFeaturedPacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SamplePackDTO> packs = samplePackService.getFeaturedPacks(pageable);
        return ResponseEntity.ok(packs);
    }

    // ================ Actions ================

    /**
     * Increment download count
     * POST /api/v1/audio/packs/{packId}/download
     */
    @PostMapping("/{packId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> incrementDownload(@PathVariable UUID packId) {
        samplePackService.incrementDownloadCount(packId);
        return ResponseEntity.ok(ApiResponse.successMessage("Download recorded"));
    }

    /**
     * Rate a pack
     * POST /api/v1/audio/packs/{packId}/rate
     */
    @PostMapping("/{packId}/rate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> ratePack(
            @PathVariable UUID packId,
            @RequestParam Double rating) {
        if (rating < 1.0 || rating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1.0 and 5.0");
        }
        samplePackService.updatePackRating(packId, rating);
        return ResponseEntity.ok(ApiResponse.successMessage("Rating updated"));
    }

    // ================ Statistics ================

    /**
     * Get producer statistics
     * GET /api/v1/audio/packs/producer/{authorId}/stats
     */
    @GetMapping("/producer/{authorId}/stats")
    public ResponseEntity<ProducerStatsDTO> getProducerStats(@PathVariable UUID authorId) {
        ProducerStatsDTO stats = samplePackService.getProducerStats(authorId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get my producer statistics
     * GET /api/v1/audio/packs/producer/me/stats
     */
    @GetMapping("/producer/me/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProducerStatsDTO> getMyProducerStats() {
        UUID authorId = SecurityUtil.getCurrentUserId();
        ProducerStatsDTO stats = samplePackService.getProducerStats(authorId);
        return ResponseEntity.ok(stats);
    }
}