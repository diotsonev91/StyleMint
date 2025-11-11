package bg.softuni.stylemint.product.audio.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackBindingService;
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
@RequestMapping(BASE + "/audio/samples")
@RequiredArgsConstructor
public class AudioSampleController {

    private final AudioSampleService audioSampleService;
    private final SamplePackBindingService samplePackBindingService;

    // ================ CRUD Operations ================

    /**
     * Upload a new audio sample
     * POST /api/v1/audio/samples
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AudioSampleDTO>> uploadSample(
            @Valid @ModelAttribute UploadSampleRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        AudioSampleDTO sample = audioSampleService.uploadSample(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(sample, "Sample uploaded successfully"));
    }

    /**
     * Get sample by ID
     * GET /api/v1/audio/samples/{sampleId}
     */
    @GetMapping("/{sampleId}")
    public ResponseEntity<AudioSampleDTO> getSample(@PathVariable UUID sampleId) {
        AudioSampleDTO sample = audioSampleService.getSampleById(sampleId);
        return ResponseEntity.ok(sample);
    }

    /**
     * Update sample file and metadata
     * PUT /api/v1/audio/samples/{sampleId}
     */
    @PutMapping(value = "/{sampleId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AudioSampleDTO>> updateSample(
            @PathVariable UUID sampleId,
            @Valid @ModelAttribute UploadSampleRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        AudioSampleDTO sample = audioSampleService.updateSample(sampleId, authorId, request);
        return ResponseEntity.ok(ApiResponse.success(sample, "Sample updated successfully"));
    }

    /**
     * Update sample metadata
     * PUT /api/v1/audio/samples/{sampleId}
     */
    @PutMapping(value = "/{sampleId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AudioSampleDTO>> updateSampleMetadata(
            @PathVariable UUID sampleId,
            @Valid @RequestBody UpdateSampleRequest request) {

        UUID authorId = SecurityUtil.getCurrentUserId();
        AudioSampleDTO updated = audioSampleService.updateSampleMetadata(sampleId, authorId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Sample metadata updated successfully"));
    }

    /**
     * Delete sample
     * DELETE /api/v1/audio/samples/{sampleId}
     */
    @DeleteMapping("/{sampleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteSample(@PathVariable UUID sampleId) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        audioSampleService.deleteSample(sampleId, authorId);
        return ResponseEntity.noContent().build();
    }

    // ================ Listing Operations ================

    /**
     * Get all samples by current user
     * GET /api/v1/audio/samples/my-samples
     */
    @GetMapping("/my-samples")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AudioSampleDTO>> getMySamples() {
        UUID authorId = SecurityUtil.getCurrentUserId();
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByAuthor(authorId);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by author ID
     * GET /api/v1/audio/samples/author/{authorId}
     */
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<AudioSampleDTO>> getSamplesByAuthor(@PathVariable UUID authorId) {
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByAuthor(authorId);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by genre
     * GET /api/v1/audio/samples/genre/{genre}
     */
    @GetMapping("/genre/{genre}")
    public ResponseEntity<Page<AudioSampleDTO>> getSamplesByGenre(
            @PathVariable Genre genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<AudioSampleDTO> samples = audioSampleService.getSamplesByGenre(genre, pageable);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by sample type
     * GET /api/v1/audio/samples/type/{sampleType}
     */
    @GetMapping("/type/{sampleType}")
    public ResponseEntity<List<AudioSampleDTO>> getSamplesByType(@PathVariable SampleType sampleType) {
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByType(sampleType);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by instrument group
     * GET /api/v1/audio/samples/instrument/{instrumentGroup}
     */
    @GetMapping("/instrument/{instrumentGroup}")
    public ResponseEntity<List<AudioSampleDTO>> getSamplesByInstrument(
            @PathVariable InstrumentGroup instrumentGroup) {
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByInstrumentGroup(instrumentGroup);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by musical key
     * GET /api/v1/audio/samples/key/{key}
     */
    @GetMapping("/key/{key}")
    public ResponseEntity<List<AudioSampleDTO>> getSamplesByKey(@PathVariable MusicalKey key) {
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByKey(key);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get samples by BPM range
     * GET /api/v1/audio/samples/bpm
     */
    @GetMapping("/bpm")
    public ResponseEntity<List<AudioSampleDTO>> getSamplesByBpmRange(
            @RequestParam Integer minBpm,
            @RequestParam Integer maxBpm) {
        List<AudioSampleDTO> samples = audioSampleService.getSamplesByBpmRange(minBpm, maxBpm);
        return ResponseEntity.ok(samples);
    }

    /**
     * Get standalone samples (not in packs)
     * GET /api/v1/audio/samples/standalone
     */
    @GetMapping("/standalone")
    public ResponseEntity<Page<AudioSampleDTO>> getStandaloneSamples(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AudioSampleDTO> samples = audioSampleService.getStandaloneSamples(pageable);
        return ResponseEntity.ok(samples);
    }

    // ================ Search Operations ================

    /**
     * Advanced search with filters
     * POST /api/v1/audio/samples/search
     */
    @PostMapping("/search")
    public ResponseEntity<Page<AudioSampleDTO>> searchSamples(
            @RequestBody AudioSampleSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AudioSampleDTO> samples = audioSampleService.searchSamples(request, pageable);
        return ResponseEntity.ok(samples);
    }

    /**
     * Search samples by name
     * GET /api/v1/audio/samples/search/name
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<AudioSampleDTO>> searchByName(@RequestParam String name) {
        List<AudioSampleDTO> samples = audioSampleService.searchSamplesByName(name);
        return ResponseEntity.ok(samples);
    }

    /**
     * Find similar samples
     * GET /api/v1/audio/samples/{sampleId}/similar
     */
    @GetMapping("/{sampleId}/similar")
    public ResponseEntity<List<AudioSampleDTO>> findSimilarSamples(@PathVariable UUID sampleId) {
        List<AudioSampleDTO> samples = audioSampleService.findSimilarSamples(sampleId);
        return ResponseEntity.ok(samples);
    }

    // ================ Statistics ================

    /**
     * Get popular samples by genre
     * GET /api/v1/audio/samples/popular/{genre}
     */
    @GetMapping("/popular/{genre}")
    public ResponseEntity<Page<AudioSampleDTO>> getPopularSamples(
            @PathVariable Genre genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AudioSampleDTO> samples = audioSampleService.getPopularSamplesByGenre(genre, pageable);
        return ResponseEntity.ok(samples);
    }

    /**
     * Count samples by genre
     * GET /api/v1/audio/samples/count/genre/{genre}
     */
    @GetMapping("/count/genre/{genre}")
    public ResponseEntity<Long> countByGenre(@PathVariable Genre genre) {
        long count = audioSampleService.countSamplesByGenre(genre);
        return ResponseEntity.ok(count);
    }

    /**
     * Unbind sample from pack
     * DELETE /api/v1/audio/samples/{sampleId}/pack/{packId}
     */
    @DeleteMapping("/{sampleId}/pack/{packId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unbindSampleFromPack(
            @PathVariable UUID sampleId,
            @PathVariable UUID packId) {

        UUID authorId = SecurityUtil.getCurrentUserId();
        samplePackBindingService.unbindSampleFromPack(sampleId,packId, authorId);

        return ResponseEntity.ok(ApiResponse.success(null, "Sample successfully unbound from pack"));
    }
}