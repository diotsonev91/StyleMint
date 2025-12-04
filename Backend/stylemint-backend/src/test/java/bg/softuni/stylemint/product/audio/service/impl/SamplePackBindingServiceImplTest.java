package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.SamplePackStatisticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SamplePackBindingServiceImplTest {

    @Mock
    private AudioSampleRepository audioSampleRepository;

    @Mock
    private SamplePackRepository samplePackRepository;

    @Mock
    private SamplePackStatisticsService statisticsService;

    @InjectMocks
    private SamplePackBindingServiceImpl bindingService;

    private UUID userId;
    private UUID sampleId;
    private UUID packId;
    private UUID anotherUserId;
    private AudioSample audioSample;
    private SamplePack samplePack;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleId = UUID.randomUUID();
        packId = UUID.randomUUID();
        anotherUserId = UUID.randomUUID();

        audioSample = AudioSample.builder()
                .id(sampleId)
                .authorId(userId)
                .name("Test Sample")
                .build();

        samplePack = SamplePack.builder()
                .id(packId)
                .authorId(userId)
                .title("Test Pack")
                .build();

        // Add some samples to the pack initially
        AudioSample existingSample = AudioSample.builder()
                .id(UUID.randomUUID())
                .authorId(userId)
                .name("Existing Sample")
                .build();

        samplePack.addSample(existingSample);
        samplePack.addSample(audioSample);
    }

    @Test
    void bindSampleToPack_ValidRequest_ShouldBindSuccessfully() {
        // Arrange
        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act
        bindingService.bindSampleToPack(sampleId, packId, userId);

        // Assert
        verify(samplePackRepository, times(1)).save(samplePack);
        assertTrue(samplePack.getSamples().contains(audioSample));
    }

    @Test
    void bindSampleToPack_SampleNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () ->
                bindingService.bindSampleToPack(sampleId, packId, userId)
        );

        verify(samplePackRepository, never()).save(any());
    }

    @Test
    void bindSampleToPack_PackNotFound_ShouldThrowNotFoundException() {
        // Arrange
        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () ->
                bindingService.bindSampleToPack(sampleId, packId, userId)
        );
    }

    @Test
    void bindSampleToPack_UnauthorizedSampleAuthor_ShouldThrowForbidden() {
        // Arrange
        audioSample.setAuthorId(anotherUserId); // Different author

        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class, () ->
                bindingService.bindSampleToPack(sampleId, packId, userId)
        );
    }

    @Test
    void bindSampleToPack_UnauthorizedPackAuthor_ShouldThrowForbidden() {
        // Arrange
        samplePack.setAuthorId(anotherUserId); // Different pack author

        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class, () ->
                bindingService.bindSampleToPack(sampleId, packId, userId)
        );
    }

    @Test
    void bindSamplesToPack_MultipleSamples_ShouldBindAll() {
        // Arrange
        List<UUID> sampleIds = Arrays.asList(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        when(audioSampleRepository.findById(any(UUID.class)))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act
        bindingService.bindSamplesToPack(packId, userId, sampleIds);

        // Assert
        verify(samplePackRepository, times(3)).save(samplePack);
        verify(audioSampleRepository, times(3)).findById(any(UUID.class));
    }

    @Test
    void unbindSampleFromPack_UnauthorizedSampleAuthor_ShouldThrowForbidden() {
        // Arrange
        audioSample.setAuthorId(anotherUserId); // Different author

        when(audioSampleRepository.findById(sampleId))
                .thenReturn(Optional.of(audioSample));
        when(samplePackRepository.findById(packId))
                .thenReturn(Optional.of(samplePack));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class, () ->
                bindingService.unbindSampleFromPack(sampleId, packId, userId)
        );
    }


    @Test
    void bindSamplesToPack_EmptyList_ShouldNotThrow() {
        // Arrange
        List<UUID> emptyList = List.of();

        // Act & Assert - should not throw
        assertDoesNotThrow(() ->
                bindingService.bindSamplesToPack(packId, userId, emptyList)
        );

        verify(audioSampleRepository, never()).findById(any());
    }
}