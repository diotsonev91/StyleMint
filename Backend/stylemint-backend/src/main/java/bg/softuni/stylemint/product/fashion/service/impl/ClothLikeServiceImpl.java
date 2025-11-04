package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.model.ClothDesignLike;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignLikeRepository;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.repository.LikeCountProjection;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
    public void toggleLike(UUID userId, UUID designId) {
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

}
