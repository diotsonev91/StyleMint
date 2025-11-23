package bg.softuni.stylemint.product.fashion.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ClothLikeService {

    void toggleLike(UUID designId);

    long getLikesCount(UUID designId);

    Map<UUID, Long> getLikesCountForDesigns(List<UUID> designIds);


    boolean isLikedByUser(UUID id);
}
