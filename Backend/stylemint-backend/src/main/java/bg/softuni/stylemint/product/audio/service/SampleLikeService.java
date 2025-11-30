package bg.softuni.stylemint.product.audio.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SampleLikeService {

    void toggleLike(UUID sampleId);

    long getLikesCount(UUID sampleId);

    Map<UUID, Long> getLikesCountForSamples(List<UUID> sampleIds);

    boolean isLikedByUser(UUID sampleId);

    void deleteAllLikesForSample(UUID sampleId);
}
