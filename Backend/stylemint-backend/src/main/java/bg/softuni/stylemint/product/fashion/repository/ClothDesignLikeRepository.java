package bg.softuni.stylemint.product.fashion.repository;

import bg.softuni.stylemint.product.fashion.model.ClothDesignLike;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClothDesignLikeRepository extends JpaRepository<ClothDesignLike, UUID> {

    boolean existsByUserIdAndClothDesignId(UUID userId, UUID designId);

    long countByClothDesignId(UUID designId);

    void deleteByUserIdAndClothDesignId(UUID userId, UUID designId);

    @Query("SELECT l.clothDesign.id as designId, COUNT(l) as count " +
            "FROM ClothDesignLike l " +
            "WHERE l.clothDesign.id IN :designIds " +
            "GROUP BY l.clothDesign.id")
    List<LikeCountProjection> countByClothDesignIdIn(@Param("designIds") List<UUID> designIds);

    void deleteByClothDesignId(UUID designId);

    @Query("SELECT l.clothDesign.id as designId, COUNT(l) as count " +
            "FROM ClothDesignLike l " +
            "WHERE l.clothDesign.isPublic = true " +
            "GROUP BY l.clothDesign.id " +
            "ORDER BY COUNT(l) DESC")
    List<LikeCountProjection> findTopLikedPublicDesigns(Pageable pageable);
}
