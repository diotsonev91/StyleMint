package bg.softuni.stylemint.product.audio.repository;

import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.enums.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SamplePackRepository extends JpaRepository<SamplePack, UUID> {


    List<SamplePack> findByAuthorId(UUID authorId);


    List<SamplePack> findByArtist(String artist);


    List<SamplePack> findByTitleContainingIgnoreCase(String title);

    /**
     * Find packs containing a specific genre
     */
    @Query("SELECT p FROM SamplePack p JOIN p.genres g WHERE g = :genre")
    List<SamplePack> findByGenresContaining(@Param("genre") Genre genre);

    /**
     * Find packs by price range
     */
    List<SamplePack> findByPriceBetween(Double minPrice, Double maxPrice);

    /**
     * Find packs by rating range
     */
    List<SamplePack> findByRatingGreaterThanEqual(Double minRating);

    /**
     * Find packs released after date
     */
    List<SamplePack> findByReleaseDateAfter(OffsetDateTime date);

    /**
     * Find packs by sample count range
     */
    List<SamplePack> findBySampleCountBetween(Integer minCount, Integer maxCount);

    /**
     * Count packs by author
     */
    long countByAuthorId(UUID authorId);

    /**
     * Check if author has packs
     */
    boolean existsByAuthorId(UUID authorId);

    /**
     * Find top rated packs
     */
    List<SamplePack> findTop10ByOrderByRatingDesc();

    /**
     * Find most downloaded packs
     */
    List<SamplePack> findTop10ByOrderByDownloadsDesc();

    /**
     * Find latest packs
     */
    List<SamplePack> findTop10ByOrderByReleaseDateDesc();

    /**
     * Paginated search by artist
     */
    Page<SamplePack> findByArtist(String artist, Pageable pageable);

    /**
     * Custom query: Search packs with multiple filters
     */
    @Query("SELECT DISTINCT p FROM SamplePack p LEFT JOIN p.genres g WHERE " +
            "(:artist IS NULL OR p.artist LIKE %:artist%) AND " +
            "(:genre IS NULL OR g = :genre) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:minRating IS NULL OR p.rating >= :minRating)")
    Page<SamplePack> searchPacks(
            @Param("artist") String artist,
            @Param("genre") Genre genre,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    /**
     * Custom query: Find featured packs (high rating and downloads)
     */
    @Query("SELECT p FROM SamplePack p WHERE p.rating >= 4.5 AND p.downloads >= 100 ORDER BY p.rating DESC, p.downloads DESC")
    List<SamplePack> findFeaturedPacks(Pageable pageable);

    /**
     * Custom query: Get pack statistics
     */
    @Query("SELECT AVG(p.price), AVG(p.rating), AVG(p.downloads) FROM SamplePack p")
    Object[] getPackStatistics();

    /**
     * Custom query: Find similar packs by genre
     */
    @Query("SELECT DISTINCT p FROM SamplePack p JOIN p.genres g WHERE g IN :genres AND p.id != :excludeId")
    List<SamplePack> findSimilarPacks(@Param("genres") List<Genre> genres, @Param("excludeId") UUID excludeId);
}