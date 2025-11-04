package bg.softuni.stylemint.product.fashion.repository;

import aj.org.objectweb.asm.commons.Remapper;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
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
public interface ClothDesignRepository extends JpaRepository<ClothDesign, UUID> {

    /**
     * Find all designs by user
     */
    List<ClothDesign> findByUserId(UUID userId);

    /**
     * Find designs by user ordered by creation date
     */
    List<ClothDesign> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find designs by cloth type
     */
    List<ClothDesign> findByClothType(ClothType clothType);

    /**
     * Find designs by customization type
     */
    List<ClothDesign> findByCustomizationType(CustomizationType customizationType);

    /**
     * Find designs by user and cloth type
     */
    List<ClothDesign> findByUserIdAndClothType(UUID userId, ClothType clothType);

    /**
     * Find designs by user and customization type
     */
    List<ClothDesign> findByUserIdAndCustomizationType(UUID userId, CustomizationType customizationType);

    /**
     * Find designs by label
     */
    List<ClothDesign> findByLabel(String label);

    /**
     * Find designs by label (case insensitive, partial match)
     */
    List<ClothDesign> findByLabelContainingIgnoreCase(String label);

    /**
     * Find designs created after date
     */
    List<ClothDesign> findByCreatedAtAfter(OffsetDateTime date);

    /**
     * Find designs updated after date
     */
    List<ClothDesign> findByUpdatedAtAfter(OffsetDateTime date);

    /**
     * Count designs by user
     */
    long countByUserId(UUID userId);

    /**
     * Count designs by cloth type
     */
    long countByClothType(ClothType clothType);

    /**
     * Count designs by customization type
     */
    long countByCustomizationType(CustomizationType customizationType);

    /**
     * Check if user has designs
     */
    boolean existsByUserId(UUID userId);

    /**
     * Find most recent design by user
     */
    Optional<ClothDesign> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Paginated search by user
     */
    Page<ClothDesign> findByUserId(UUID userId, Pageable pageable);

    /**
     * Paginated search by cloth type
     */
    Page<ClothDesign> findByClothType(ClothType clothType, Pageable pageable);

    /**
     * Custom query: Find designs with filters
     */
    @Query("SELECT d FROM ClothDesign d WHERE " +
            "(:userId IS NULL OR d.userId = :userId) AND " +
            "(:clothType IS NULL OR d.clothType = :clothType) AND " +
            "(:customizationType IS NULL OR d.customizationType = :customizationType)")
    Page<ClothDesign> searchDesigns(
            @Param("userId") UUID userId,
            @Param("clothType") ClothType clothType,
            @Param("customizationType") CustomizationType customizationType,
            Pageable pageable
    );

    /**
     * Custom query: Get design statistics by cloth type
     */
    @Query("SELECT d.clothType, COUNT(d) FROM ClothDesign d GROUP BY d.clothType")
    List<Object[]> getDesignStatisticsByClothType();

    /**
     * Custom query: Get design statistics by customization type
     */
    @Query("SELECT d.customizationType, COUNT(d) FROM ClothDesign d GROUP BY d.customizationType")
    List<Object[]> getDesignStatisticsByCustomizationType();

    /**
     * Custom query: Find user's recent designs of specific type
     */
    @Query("SELECT d FROM ClothDesign d WHERE d.userId = :userId AND d.clothType = :clothType ORDER BY d.createdAt DESC")
    List<ClothDesign> findRecentDesignsByUserAndType(
            @Param("userId") UUID userId,
            @Param("clothType") ClothType clothType,
            Pageable pageable
    );

    Page<ClothDesign> findByIsPublic(boolean isPublic, Pageable pageable);

    long countByUserIdAndIsPublic(UUID userId, boolean b);
}