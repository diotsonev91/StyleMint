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
     * @param authorId ID of the user uploading the pack
     * @param request Upload request containing pack info and samples
     * @return Created SamplePackDTO
     */
    SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request);

    /**
     * Get pack by ID
     * @param packId Pack ID
     * @return SamplePackDTO
     */
    SamplePackDTO getPackById(UUID packId);

    /**
     * Get pack with all samples
     * @param packId Pack ID
     * @return SamplePackDetailDTO with pack info and samples
     */
    SamplePackDetailDTO getPackWithSamples(UUID packId);

    /**
     * Update pack metadata
     * @param packId Pack ID
     * @param authorId Author ID (for authorization)
     * @param request Update request
     * @return Updated SamplePackDTO
     */
    SamplePackDTO updatePack(UUID packId, UUID authorId, UploadPackRequest request);

    /**
     * Delete pack and all its samples
     * @param packId Pack ID
     * @param authorId Author ID (for authorization)
     */
    void deletePack(UUID packId, UUID authorId);

    // ================ Listing Operations ================

    /**
     * Get all packs by author
     * @param authorId Author ID
     * @return List of SamplePackDTO
     */
    List<SamplePackDTO> getPacksByAuthor(UUID authorId);

    /**
     * Get packs by artist name
     * @param artist Artist name
     * @param pageable Pagination info
     * @return Page of SamplePackDTO
     */
    Page<SamplePackDTO> getPacksByArtist(String artist, Pageable pageable);

    /**
     * Get packs containing a specific genre
     * @param genre Genre enum
     * @return List of SamplePackDTO
     */
    List<SamplePackDTO> getPacksByGenre(Genre genre);

    /**
     * Get all packs (paginated)
     * @param pageable Pagination info
     * @return Page of SamplePackDTO
     */
    Page<SamplePackDTO> getAllPacks(Pageable pageable);

    // ================ Search Operations ================

    /**
     * Advanced search with multiple filters
     * @param request Search request with filters
     * @param pageable Pagination info
     * @return Page of SamplePackDTO
     */
    Page<SamplePackDTO> searchPacks(SamplePackSearchRequest request, Pageable pageable);

    /**
     * Search packs by title
     * @param title Title to search (partial match)
     * @return List of SamplePackDTO
     */
    List<SamplePackDTO> searchPacksByTitle(String title);

    /**
     * Find similar packs based on genres
     * @param packId Pack ID to find similar to
     * @return List of similar SamplePackDTO
     */
    List<SamplePackDTO> findSimilarPacks(UUID packId);

    // ================ Featured/Popular Operations ================

    /**
     * Get top rated packs
     * @return List of top 10 SamplePackDTO
     */
    List<SamplePackDTO> getTopRatedPacks();

    /**
     * Get most downloaded packs
     * @return List of top 10 SamplePackDTO
     */
    List<SamplePackDTO> getMostDownloadedPacks();

    /**
     * Get latest released packs
     * @return List of top 10 SamplePackDTO
     */
    List<SamplePackDTO> getLatestPacks();

    /**
     * Get featured packs (high rating and downloads)
     * @param pageable Pagination info
     * @return Page of featured SamplePackDTO
     */
    Page<SamplePackDTO> getFeaturedPacks(Pageable pageable);

    // ================ Statistics ================

    /**
     * Count packs by author
     * @param authorId Author ID
     * @return Count of packs
     */
    long countPacksByAuthor(UUID authorId);

    /**
     * Increment download count for a pack
     * @param packId Pack ID
     */
    void incrementDownloadCount(UUID packId);

    /**
     * Update pack rating
     * @param packId Pack ID
     * @param rating New rating (1-5)
     */
    void updatePackRating(UUID packId, Double rating);

    /**
     * Get producer statistics
     * @param authorId Author ID
     * @return ProducerStatsDTO with comprehensive stats
     */
    ProducerStatsDTO getProducerStats(UUID authorId);
}