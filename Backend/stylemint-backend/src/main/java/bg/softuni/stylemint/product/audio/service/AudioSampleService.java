package bg.softuni.stylemint.product.audio.service;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AudioSampleService {

    // ================ CRUD Operations ================

    /**
     * Upload a new audio sample
     * @param authorId ID of the user uploading the sample
     * @param request Upload request containing file and metadata
     * @return Created AudioSampleDTO
     */
    AudioSampleDTO uploadSample(UUID authorId, UploadSampleRequest request);

    /**
     * Get sample by ID
     * @param sampleId Sample ID
     * @return AudioSampleDTO
     */
    AudioSampleDTO getSampleById(UUID sampleId);

    /**
     * Update sample metadata
     * @param sampleId Sample ID
     * @param authorId Author ID (for authorization)
     * @param request Update request
     * @return Updated AudioSampleDTO
     */
    AudioSampleDTO updateSample(UUID sampleId, UUID authorId, UploadSampleRequest request);

    /**
     * Delete sample
     * @param sampleId Sample ID
     * @param authorId Author ID (for authorization)
     */
    void deleteSample(UUID sampleId, UUID authorId);

    // ================ Listing Operations ================

    /**
     * Get all samples by author
     * @param authorId Author ID
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByAuthor(UUID authorId);

    /**
     * Get all samples by genre
     * @param genre Genre enum
     * @param pageable Pagination info
     * @return Page of AudioSampleDTO
     */
    Page<AudioSampleDTO> getSamplesByGenre(Genre genre, Pageable pageable);

    /**
     * Get samples by sample type
     * @param sampleType Sample type (LOOP or ONESHOT)
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByType(SampleType sampleType);

    /**
     * Get samples by instrument group
     * @param instrumentGroup Instrument group enum
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByInstrumentGroup(InstrumentGroup instrumentGroup);

    /**
     * Get samples in specific BPM range
     * @param minBpm Minimum BPM
     * @param maxBpm Maximum BPM
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByBpmRange(Integer minBpm, Integer maxBpm);

    /**
     * Get samples by musical key
     * @param key Musical key enum
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByKey(MusicalKey key);

    /**
     * Get standalone samples (not in any pack)
     * @param pageable Pagination info
     * @return Page of AudioSampleDTO
     */
    Page<AudioSampleDTO> getStandaloneSamples(Pageable pageable);

    /**
     * Get samples in a specific pack
     * @param packId Pack ID
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> getSamplesByPack(UUID packId);

    // ================ Search Operations ================

    /**
     * Advanced search with multiple filters
     * @param request Search request with filters
     * @param pageable Pagination info
     * @return Page of AudioSampleDTO
     */
    Page<AudioSampleDTO> searchSamples(AudioSampleSearchRequest request, Pageable pageable);

    /**
     * Search samples by name
     * @param name Name to search (partial match)
     * @return List of AudioSampleDTO
     */
    List<AudioSampleDTO> searchSamplesByName(String name);

    /**
     * Find similar samples based on genre and BPM
     * @param sampleId Sample ID to find similar to
     * @return List of similar AudioSampleDTO
     */
    List<AudioSampleDTO> findSimilarSamples(UUID sampleId);

    // ================ Statistics ================

    /**
     * Count samples by author
     * @param authorId Author ID
     * @return Count of samples
     */
    long countSamplesByAuthor(UUID authorId);

    /**
     * Count samples by genre
     * @param genre Genre enum
     * @return Count of samples
     */
    long countSamplesByGenre(Genre genre);

    /**
     * Get popular samples by genre
     * @param genre Genre enum
     * @param pageable Pagination info
     * @return Page of popular AudioSampleDTO
     */
    Page<AudioSampleDTO> getPopularSamplesByGenre(Genre genre, Pageable pageable);
}