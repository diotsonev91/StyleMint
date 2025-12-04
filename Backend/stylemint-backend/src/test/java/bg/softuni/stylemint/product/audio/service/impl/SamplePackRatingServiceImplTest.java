package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.model.PackRating;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.PackRatingRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SamplePackRatingServiceImplTest {

    @Mock
    private PackRatingRepository packRatingRepository;

    @Mock
    private SamplePackRepository samplePackRepository;

    @InjectMocks
    private SamplePackRatingServiceImpl ratingService;

    private UUID userId;
    private UUID packId;
    private UUID authorId;
    private SamplePack samplePack;
    private PackRating packRating;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        packId = UUID.randomUUID();
        authorId = UUID.randomUUID();

        samplePack = SamplePack.builder()
                .id(packId)
                .authorId(authorId)
                .title("Test Pack")
                .rating(0.0)
                .build();

        packRating = new PackRating();
        packRating.setId(UUID.randomUUID());
        packRating.setSamplePack(samplePack);
        packRating.setUserId(userId);
        packRating.setRating(4.5);
    }


    @Test
    void updateUserPackRate_RateOwnPack_ShouldThrowForbidden() {
        // Arrange
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act & Assert - user tries to rate their own pack
        assertThrows(ForbiddenOperationException.class, () ->
                ratingService.updateUserPackRate(packId, authorId, 4.5)
        );

        verify(packRatingRepository, never()).save(any());
    }

    @Test
    void updateUserPackRate_PackNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () ->
                ratingService.updateUserPackRate(packId, userId, 4.5)
        );
    }

    @Test
    void updateUserPackRate_InvalidRatingBelow1_ShouldThrowForbidden() {
        // Act & Assert
        assertThrows(ForbiddenOperationException.class, () ->
                ratingService.updateUserPackRate(packId, userId, 0.5)
        );
    }

    @Test
    void updateUserPackRate_InvalidRatingAbove5_ShouldThrowForbidden() {
        // Act & Assert
        assertThrows(ForbiddenOperationException.class, () ->
                ratingService.updateUserPackRate(packId, userId, 5.5)
        );
    }

    @Test
    void getUserPackRate_UserHasRating_ShouldReturnRating() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(samplePackRepository.findById(packId))
                    .thenReturn(Optional.of(samplePack));
            when(packRatingRepository.findBySamplePackAndUserId(samplePack, userId))
                    .thenReturn(Optional.of(packRating));

            // Act
            Double result = ratingService.getUserPackRate(packId);

            // Assert
            assertEquals(4.5, result);
        }
    }

    @Test
    void getUserPackRate_UserNoRating_ShouldReturnNull() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(samplePackRepository.findById(packId))
                    .thenReturn(Optional.of(samplePack));
            when(packRatingRepository.findBySamplePackAndUserId(samplePack, userId))
                    .thenReturn(Optional.empty());

            // Act
            Double result = ratingService.getUserPackRate(packId);

            // Assert
            assertNull(result);
        }
    }

    @Test
    void getUserPackRate_PackNotFound_ShouldThrowNotFoundException() {
        // Arrange
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);

            when(samplePackRepository.findById(packId))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NotFoundException.class, () ->
                    ratingService.getUserPackRate(packId)
            );
        }
    }

    @Test
    void updatePackAverageRating_MultipleRatings_ShouldCalculateCorrectAverage() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        // Arrange
        PackRating rating1 = new PackRating();
        rating1.setRating(3.0);

        PackRating rating2 = new PackRating();
        rating2.setRating(4.0);

        PackRating rating3 = new PackRating();
        rating3.setRating(5.0);

        when(packRatingRepository.findBySamplePack(samplePack))
                .thenReturn(List.of(rating1, rating2, rating3));

        // Act - using reflection to test private method
        java.lang.reflect.Method method = SamplePackRatingServiceImpl.class
                .getDeclaredMethod("updatePackAverageRating", SamplePack.class);
        method.setAccessible(true);
        method.invoke(ratingService, samplePack);

        // Assert
        assertEquals(4.0, samplePack.getRating(), 0.1); // (3+4+5)/3 = 4.0
    }

    @Test
    void updatePackAverageRating_NoRatings_ShouldSetToZero() {
        // Arrange
        when(packRatingRepository.findBySamplePack(samplePack))
                .thenReturn(List.of());

        // Act - using reflection
        try {
            java.lang.reflect.Method method = SamplePackRatingServiceImpl.class
                    .getDeclaredMethod("updatePackAverageRating", SamplePack.class);
            method.setAccessible(true);
            method.invoke(ratingService, samplePack);
        } catch (Exception e) {
            fail("Failed to invoke private method");
        }

        // Assert
        assertEquals(0.0, samplePack.getRating(), 0.1);
    }

    @Test
    void validateRate_ValidRating_ShouldNotThrow() {
        // Act & Assert - should not throw
        assertDoesNotThrow(() -> ratingService.validateRate(1.0));
        assertDoesNotThrow(() -> ratingService.validateRate(3.0));
        assertDoesNotThrow(() -> ratingService.validateRate(5.0));
    }
}