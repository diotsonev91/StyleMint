package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.model.ClothDesignLike;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignLikeRepository;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.repository.LikeCountProjection;
import bg.softuni.stylemint.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClothLikeServiceImplTest {

    @Mock
    private ClothDesignLikeRepository likeRepository;

    @Mock
    private ClothDesignRepository clothRepository;

    @InjectMocks
    private ClothLikeServiceImpl clothLikeService;

    private UUID userId;
    private UUID designId;
    private ClothDesign design;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        designId = UUID.randomUUID();
        design = ClothDesign.builder().id(designId).build();
    }

    @Test
    void toggleLike_WhenLikeExists_ShouldRemoveLike() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(likeRepository.existsByUserIdAndClothDesignId(userId, designId)).thenReturn(true);

            // Act
            clothLikeService.toggleLike(designId);

            // Assert
            verify(likeRepository).deleteByUserIdAndClothDesignId(userId, designId);
            verify(likeRepository, never()).save(any());
        }
    }

    @Test
    void toggleLike_WhenLikeNotExists_ShouldAddLike() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(likeRepository.existsByUserIdAndClothDesignId(userId, designId)).thenReturn(false);
            when(clothRepository.findById(designId)).thenReturn(Optional.of(design));

            // Act
            clothLikeService.toggleLike(designId);

            // Assert
            verify(likeRepository).save(any(ClothDesignLike.class));
            verify(likeRepository, never()).deleteByUserIdAndClothDesignId(any(), any());
        }
    }

    @Test
    void toggleLike_WhenDesignNotFound_ShouldThrowException() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(likeRepository.existsByUserIdAndClothDesignId(userId, designId)).thenReturn(false);
            when(clothRepository.findById(designId)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> clothLikeService.toggleLike(designId));

            assertTrue(exception.getMessage().contains("Design not found"));
        }
    }

    @Test
    void getLikesCount_ShouldReturnCount() {
        // Arrange
        long expectedCount = 5L;
        when(likeRepository.countByClothDesignId(designId)).thenReturn(expectedCount);

        // Act
        long result = clothLikeService.getLikesCount(designId);

        // Assert
        assertEquals(expectedCount, result);
        verify(likeRepository).countByClothDesignId(designId);
    }

    @Test
    void getLikesCountForDesigns_ShouldReturnMap() {
        // Arrange
        List<UUID> designIds = Arrays.asList(designId, UUID.randomUUID());
        LikeCountProjection projection1 = mock(LikeCountProjection.class);
        when(projection1.getDesignId()).thenReturn(designId);
        when(projection1.getCount()).thenReturn(5L);

        when(likeRepository.countByClothDesignIdIn(designIds)).thenReturn(Arrays.asList(projection1));

        // Act
        Map<UUID, Long> result = clothLikeService.getLikesCountForDesigns(designIds);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(5L, result.get(designId));
    }

    @Test
    void isLikedByUser_ShouldReturnTrueWhenLiked() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(likeRepository.existsByUserIdAndClothDesignId(userId, designId)).thenReturn(true);

            // Act
            boolean result = clothLikeService.isLikedByUser(designId);

            // Assert
            assertTrue(result);
        }
    }

    @Test
    void isLikedByUser_ShouldReturnFalseWhenNotLiked() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(likeRepository.existsByUserIdAndClothDesignId(userId, designId)).thenReturn(false);

            // Act
            boolean result = clothLikeService.isLikedByUser(designId);

            // Assert
            assertFalse(result);
        }
    }

    @Test
    void deleteAllLikesForDesign_ShouldDeleteLikes() {
        // Act
        clothLikeService.deleteAllLikesForDesign(designId);

        // Assert
        verify(likeRepository).deleteByClothDesignId(designId);
    }
}