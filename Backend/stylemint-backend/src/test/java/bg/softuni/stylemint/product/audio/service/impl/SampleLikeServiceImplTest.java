package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SampleLike;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLikeCountProjection;
import bg.softuni.stylemint.product.audio.repository.SampleLikeRepository;
import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SampleLikeServiceImplTest {

    @Mock
    private SampleLikeRepository likeRepository;

    @Mock
    private AudioSampleRepository sampleRepository;

    @InjectMocks
    private SampleLikeServiceImpl sampleLikeService;

    private UUID userId;
    private UUID sampleId;
    private AudioSample audioSample;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("test@example.com")
                .build();

        audioSample = AudioSample.builder()
                .id(sampleId)
                .name("Test Sample")
                .build();
    }

    @Test
    void toggleLike_LikeDoesNotExist_ShouldCreateLike() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId))
                    .thenReturn(false);
            when(sampleRepository.findById(sampleId))
                    .thenReturn(Optional.of(audioSample));
            when(likeRepository.save(any(SampleLike.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            sampleLikeService.toggleLike(sampleId);

            // Assert
            verify(likeRepository, times(1)).save(any(SampleLike.class));
            verify(likeRepository, never()).deleteByUserIdAndAudioSampleId(any(), any());
        }
    }

    @Test
    void toggleLike_LikeExists_ShouldDeleteLike() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId))
                    .thenReturn(true);

            // Act
            sampleLikeService.toggleLike(sampleId);

            // Assert
            verify(likeRepository, times(1))
                    .deleteByUserIdAndAudioSampleId(userId, sampleId);
            verify(likeRepository, never()).save(any());
            verify(sampleRepository, never()).findById(any());
        }
    }

    @Test
    void toggleLike_SampleNotFound_ShouldThrowException() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId))
                    .thenReturn(false);
            when(sampleRepository.findById(sampleId))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(EntityNotFoundException.class, () ->
                    sampleLikeService.toggleLike(sampleId)
            );

            verify(likeRepository, never()).save(any());
        }
    }

    @Test
    void getLikesCount_ShouldReturnCorrectCount() {
        // Arrange
        long expectedCount = 5L;
        when(likeRepository.countByAudioSampleId(sampleId))
                .thenReturn(expectedCount);

        // Act
        long result = sampleLikeService.getLikesCount(sampleId);

        // Assert
        assertEquals(expectedCount, result);
        verify(likeRepository, times(1)).countByAudioSampleId(sampleId);
    }

    @Test
    void getLikesCountForSamples_ShouldReturnMapWithCounts() {
        // Arrange
        List<UUID> sampleIds = Arrays.asList(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        List<SampleLikeCountProjection> projections = Arrays.asList(
                new SampleLikeCountProjectionImpl(sampleIds.get(0), 10L),
                new SampleLikeCountProjectionImpl(sampleIds.get(1), 5L)
        );

        when(likeRepository.countByAudioSampleIdIn(sampleIds))
                .thenReturn(projections);

        // Act
        Map<UUID, Long> result = sampleLikeService.getLikesCountForSamples(sampleIds);

        // Assert
        assertEquals(2, result.size());
        assertEquals(10L, result.get(sampleIds.get(0)));
        assertEquals(5L, result.get(sampleIds.get(1)));
        assertNull(result.get(sampleIds.get(2))); // Not in projections
    }

    @Test
    void isLikedByUser_UserHasLiked_ShouldReturnTrue() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId))
                    .thenReturn(true);

            // Act
            boolean result = sampleLikeService.isLikedByUser(sampleId);

            // Assert
            assertTrue(result);
        }
    }

    @Test
    void isLikedByUser_UserHasNotLiked_ShouldReturnFalse() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(likeRepository.existsByUserIdAndAudioSampleId(userId, sampleId))
                    .thenReturn(false);

            // Act
            boolean result = sampleLikeService.isLikedByUser(sampleId);

            // Assert
            assertFalse(result);
        }
    }

    @Test
    void deleteAllLikesForSample_ShouldCallRepository() {
        // Act
        sampleLikeService.deleteAllLikesForSample(sampleId);

        // Assert
        verify(likeRepository, times(1)).deleteByAudioSampleId(sampleId);
    }

    // Helper class for projections
    private static class SampleLikeCountProjectionImpl implements SampleLikeCountProjection {
        private final UUID sampleId;
        private final Long count;

        public SampleLikeCountProjectionImpl(UUID sampleId, Long count) {
            this.sampleId = sampleId;
            this.count = count;
        }

        @Override
        public UUID getSampleId() {
            return sampleId;
        }

        @Override
        public long getCount() {
            return count;
        }
    }
}