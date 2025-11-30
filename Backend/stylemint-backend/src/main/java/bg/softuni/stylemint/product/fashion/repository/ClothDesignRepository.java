package bg.softuni.stylemint.product.fashion.repository;

import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClothDesignRepository extends JpaRepository<ClothDesign, UUID> {

    List<ClothDesign> findByUserId(UUID userId);

    @Query("""
    SELECT d 
    FROM ClothDesign d 
    WHERE d.userId = :userId 
      AND (d.autoSaved = FALSE OR d.autoSaved IS NULL)
    ORDER BY d.createdAt DESC
    """)
    List<ClothDesign> findUserNonAutosaveDesigns(@Param("userId") UUID userId);

    List<ClothDesign> findByAutoSavedTrueAndCreatedAtBefore(OffsetDateTime before);

    long countByUserId(UUID userId);

    Page<ClothDesign> findByClothType(ClothType clothType, Pageable pageable);

    @Query("""
SELECT d FROM ClothDesign d
WHERE d.isPublic = true
""")
    Page<ClothDesign> findByIsPublicTrue(Pageable pageable);


    long countByUserIdAndIsPublic(UUID userId, boolean b);

    List<ClothDesign> findAllByIdInAndIsPublicTrue(List<UUID> designIds);
}