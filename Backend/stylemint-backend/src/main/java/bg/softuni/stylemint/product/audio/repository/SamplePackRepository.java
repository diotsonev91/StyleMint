package bg.softuni.stylemint.product.audio.repository;

import aj.org.objectweb.asm.commons.Remapper;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.enums.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SamplePackRepository extends JpaRepository<SamplePack, UUID> {


    List<SamplePack> findByAuthorIdAndArchivedFalse(UUID authorId);



    List<SamplePack> findByTitleContainingIgnoreCaseAndArchivedFalse(String title);

    /**
     * Find packs containing a specific genre and not archived
     */
    @Query("SELECT p FROM SamplePack p JOIN p.genres g WHERE g = :genre AND p.archived = false")
    List<SamplePack> findByGenresContainingAndArchivedFalse(@Param("genre") Genre genre);


    @Query("select p from SamplePack p join fetch p.samples where p.id = :packId")
    SamplePack fetchPackWithSamples(UUID packId);


    /**
     * Count packs by author
     */
    long countByAuthorId(UUID authorId);


    @Query("SELECT p FROM SamplePack p WHERE p.archived = false ORDER BY p.rating DESC")
    List<SamplePack> findTop10ByOrderByRatingDescAndArchivedFalse();

    @Query("SELECT p FROM SamplePack p WHERE p.archived = false ORDER BY p.downloads DESC")
    List<SamplePack> findTop10ByOrderByDownloadsDescAndArchivedFalse();

    @Query("SELECT p FROM SamplePack p WHERE p.archived = false ORDER BY p.releaseDate DESC")
    List<SamplePack> findTop10ByOrderByReleaseDateDescAndArchivedFalse();


    /**
     * Paginated search by artist
     */
    Page<SamplePack> findByArtistAndArchivedFalse(String artist, Pageable pageable);

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


    boolean existsByIdAndAuthorId(UUID packId, UUID authorId);

    Page<SamplePack>  findByArchivedFalse(Pageable pageable);

    List<SamplePack> findByArchivedTrue();
}