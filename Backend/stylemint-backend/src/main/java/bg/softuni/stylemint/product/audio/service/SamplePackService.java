package bg.softuni.stylemint.product.audio.service;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SamplePackService {

    // ================ CRUD Operations ================

    /**
     * Upload a new sample pack with multiple samples
     * Reuses AudioSampleService for individual sample uploads
     */
    SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request);

    /**
     * Get pack by ID
     */
    SamplePackDTO getPackById(UUID packId);

    /**
     * Get pack with all its samples
     */
    SamplePackDetailDTO getPackWithSamples(UUID packId);

    /**
     * Update pack metadata (excludes samples)
     */
    SamplePackDTO updatePack(UUID packId, UUID authorId, UpdatePackRequest request);


    /**
     * Delete pack and all associated samples
     */
    void deleteArchivedPacks();

    // ================ Query Methods ================

    /**
     * Get all packs by a specific author
     */
    List<SamplePackDTO> getPacksByAuthor(UUID authorId);

    /**
     * Get packs by artist name (paginated)
     */
    Page<SamplePackDTO> getPacksByArtist(String artist, Pageable pageable);

    /**
     * Get packs containing a specific genre
     */
    List<SamplePackDTO> getPacksByGenre(Genre genre);

    /**
     * Get all packs (paginated)
     */
    Page<SamplePackDTO> getAllPacks(Pageable pageable);

    /**
     * Search packs with filters
     */
    Page<SamplePackDTO> searchPacks(SamplePackSearchRequest request, Pageable pageable);

    /**
     * Search packs by title
     */
    List<SamplePackDTO> searchPacksByTitle(String title);

    /**
     * Find similar packs based on genres
     */
    List<SamplePackDTO> findSimilarPacks(UUID packId);

    /**
     * Get top 10 rated packs
     */
    List<SamplePackDTO> getTopRatedPacks();

    /**
     * Get most downloaded packs
     */
    List<SamplePackDTO> getMostDownloadedPacks();

    /**
     * Get latest released packs
     */
    List<SamplePackDTO> getLatestPacks();



    // ================ Statistics ================

    /**
     * Count packs by author
     */
    long countPacksByAuthor(UUID authorId);

    /**
     * Increment download count for a pack
     */
    void incrementDownloadCount(UUID packId);


    /**
     * Get producer statistics
     */
    ProducerStatsDTO getProducerStats(UUID authorId);

    // In SamplePackService interface - ADD THIS METHOD
    boolean validatePackOwnership(UUID packId, UUID authorId);

    void archiveAllByAuthor(UUID targetUserId);

    void adminArchivePack(UUID packId);

    void archivePackByUser(UUID samplePackId, UUID authorId);

}