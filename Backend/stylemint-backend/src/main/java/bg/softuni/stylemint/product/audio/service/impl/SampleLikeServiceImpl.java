package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SampleLike;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLikeCountProjection;
import bg.softuni.stylemint.product.audio.repository.SampleLikeRepository;
import bg.softuni.stylemint.product.audio.service.SampleLikeService;
import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SampleLikeServiceImpl implements SampleLikeService {

    private final SampleLikeRepository likeRepository;
    private final AudioSampleRepository sampleRepository;

    @Override
    @Transactional
    public void toggleLike(UUID sampleId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        if (likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId)) {
            likeRepository.deleteByUserIdAndAudioSampleId(userId, sampleId);
        } else {
            AudioSample sample = sampleRepository.findById(sampleId)
                    .orElseThrow(() -> new EntityNotFoundException("Sample not found"));

            SampleLike like = SampleLike.builder()
                    .user(User.builder().id(userId).build())
                    .audioSample(sample)
                    .build();

            likeRepository.save(like);
        }
    }

    @Override
    public long getLikesCount(UUID sampleId) {
        return likeRepository.countByAudioSampleId(sampleId);
    }

    @Override
    public Map<UUID, Long> getLikesCountForSamples(List<UUID> sampleIds) {
        return likeRepository.countByAudioSampleIdIn(sampleIds).stream()
                .collect(Collectors.toMap(
                        SampleLikeCountProjection::getSampleId,
                        SampleLikeCountProjection::getCount
                ));
    }

    @Override
    public boolean isLikedByUser(UUID sampleId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        return likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId);
    }

    @Override
    @Transactional
    public void deleteAllLikesForSample(UUID sampleId) {
        likeRepository.deleteByAudioSampleId(sampleId);
    }
}
