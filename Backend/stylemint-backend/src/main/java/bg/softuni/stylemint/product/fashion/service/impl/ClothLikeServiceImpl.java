package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.model.ClothDesignLike;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignLikeRepository;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.repository.LikeCountProjection;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClothLikeServiceImpl implements ClothLikeService {

    private final ClothDesignLikeRepository likeRepository;
    private final ClothDesignRepository clothRepository;

    @Override
    @Transactional
    public void toggleLike(UUID designId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        if (likeRepository.existsByUserIdAndClothDesignId(userId, designId)) {
            likeRepository.deleteByUserIdAndClothDesignId(userId, designId);
        } else {
            ClothDesign design = clothRepository.findById(designId)
                    .orElseThrow(() -> new EntityNotFoundException("Design not found"));

            ClothDesignLike like = ClothDesignLike.builder()
                    .user(User.builder().id(userId).build())
                    .clothDesign(design)
                    .build();

            likeRepository.save(like);
        }
    }

    @Override
    public long getLikesCount(UUID designId) {
        return likeRepository.countByClothDesignId(designId);
    }

    @Override
    public Map<UUID, Long> getLikesCountForDesigns(List<UUID> designIds) {
        return likeRepository.countByClothDesignIdIn(designIds).stream()
                .collect(Collectors.toMap(
                        LikeCountProjection::getDesignId,
                        LikeCountProjection::getCount
                ));
    }

    @Override
    public boolean isLikedByUser(UUID designId) {

        UUID userId = SecurityUtil.getCurrentUserId();
        return likeRepository.existsByUserIdAndClothDesignId(userId, designId);
    }

    @Override
    public void deleteAllLikesForDesign(UUID designId) {
        likeRepository.deleteByClothDesignId(designId);
    }

    @Override
    public List<LikeCountProjection> getTopLikedDesignIds(int limit) {
        // Validate limit
        if (limit < 1 || limit > 50) {
            limit = 10;
        }

        Pageable pageable = PageRequest.of(0, limit);

        // Get top liked design IDs from the repository
        return likeRepository.findTopLikedPublicDesigns(pageable);
    }

}
