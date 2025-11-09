package bg.softuni.stylemint.product.audio.repository;

import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AudioSampleRepository extends JpaRepository<AudioSample, UUID> {

    /**
     * Find samples by author
     */
    List<AudioSample> findByAuthorId(UUID authorId);

    /**
     * Find samples by artist name
     */
    List<AudioSample> findByArtist(String artist);

    /**
     * Find samples by genre
     */
    List<AudioSample> findByGenre(Genre genre);

    /**
     * Find samples by sample type
     */
    List<AudioSample> findBySampleType(SampleType sampleType);

    /**
     * Find samples by BPM range
     */
    List<AudioSample> findByBpmBetween(Integer minBpm, Integer maxBpm);

    /**
     * Find samples by key signature
     */
    List<AudioSample> findByKey(MusicalKey key);

    /**
     * Find samples by instrument group
     */
    List<AudioSample> findByInstrumentGroup(InstrumentGroup instrumentGroup);

    /**
     * Find samples in a specific pack
     */
    List<AudioSample> findByPack(SamplePack pack);

    /**
     * Find samples by pack ID
     */
    List<AudioSample> findByPackId(UUID packId);

    /**
     * Find standalone samples (not in any pack)
     */
    List<AudioSample> findByPackIsNull();

    /**
     * Find samples by price range
     */
    List<AudioSample> findByPriceBetween(Double minPrice, Double maxPrice);

    /**
     * Find samples by name (case insensitive, partial match)
     */
    List<AudioSample> findByNameContainingIgnoreCase(String name);

    /**
     * Count samples by genre
     */
    long countByGenre(Genre genre);

    /**
     * Count samples in a pack
     */
    long countByPack(SamplePack pack);

    long countByAuthorId(UUID userId);

    /**
     * Check if author has samples
     */
    boolean existsByAuthorId(UUID authorId);

    /**
     * Paginated search by genre
     */
    Page<AudioSample> findByGenre(Genre genre, Pageable pageable);

    /**
     * Custom query: Search samples with filters
     */
    @Query("SELECT s FROM AudioSample s WHERE " +
            "(:genre IS NULL OR s.genre = :genre) AND " +
            "(:sampleType IS NULL OR s.sampleType = :sampleType) AND " +
            "(:minBpm IS NULL OR s.bpm >= :minBpm) AND " +
            "(:maxBpm IS NULL OR s.bpm <= :maxBpm) AND " +
            "(:key IS NULL OR s.key = :key) AND " +
            "(:instrumentGroup IS NULL OR s.instrumentGroup = :instrumentGroup)")
    Page<AudioSample> searchSamples(
            @Param("genre") Genre genre,
            @Param("sampleType") SampleType sampleType,
            @Param("minBpm") Integer minBpm,
            @Param("maxBpm") Integer maxBpm,
            @Param("key") MusicalKey key,
            @Param("instrumentGroup") InstrumentGroup instrumentGroup,
            Pageable pageable
    );

    /**
     * Custom query: Find similar samples by genre and BPM
     */
    @Query("SELECT s FROM AudioSample s WHERE s.genre = :genre " +
            "AND s.bpm BETWEEN :bpm - 10 AND :bpm + 10 " +
            "AND s.id != :excludeId")
    List<AudioSample> findSimilarSamples(
            @Param("genre") Genre genre,
            @Param("bpm") Integer bpm,
            @Param("excludeId") UUID excludeId
    );

    /**
     * Custom query: Get popular samples by genre
     */
    @Query("SELECT s FROM AudioSample s WHERE s.genre = :genre ORDER BY s.createdAt DESC")
    Page<AudioSample> findPopularByGenre(@Param("genre") Genre genre, Pageable pageable);


    List<AudioSample> findByAuthorIdAndPackIsNull(UUID authorId);
    int countByPackId(UUID packId);

}