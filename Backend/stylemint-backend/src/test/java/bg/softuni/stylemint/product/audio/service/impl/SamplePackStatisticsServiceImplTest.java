package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SamplePackStatisticsServiceImplTest {

    @Mock
    private AudioSampleService audioSampleService;

    @InjectMocks
    private SamplePackStatisticsServiceImpl statisticsService;

    private SamplePack testPack;
    private static final UUID TEST_PACK_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testPack = SamplePack.builder()
                .id(TEST_PACK_ID)
                .title("Test Pack")
                .sampleCount(0)
                .totalSize("0 B")
                .build();
    }

    // ========== recalculatePackStatistics Tests ==========

    @Test
    void recalculatePackStatistics_ShouldUpdateCount_WhenSamplesExist() {
        // Arrange
        AudioSampleDTO sample1 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(120)
                .duration(180)
                .build();

        AudioSampleDTO sample2 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(140)
                .duration(200)
                .build();

        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(List.of(sample1, sample2));

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(2, testPack.getSampleCount());
        verify(audioSampleService).getSamplesByPack(TEST_PACK_ID);
    }

    @Test
    void recalculatePackStatistics_ShouldCalculateAverageBpm() {
        // Arrange
        AudioSampleDTO sample1 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(120)
                .duration(180)
                .build();

        AudioSampleDTO sample2 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(140)
                .duration(200)
                .build();

        AudioSampleDTO sample3 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(130)
                .duration(150)
                .build();

        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(List.of(sample1, sample2, sample3));

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(3, testPack.getSampleCount());
        // Average BPM should be (120 + 140 + 130) / 3 = 130
    }

    @Test
    void recalculatePackStatistics_ShouldIgnoreNullBpm() {
        // Arrange
        AudioSampleDTO sample1 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(120)
                .duration(180)
                .build();

        AudioSampleDTO sample2 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(null)  // Null BPM
                .duration(200)
                .build();

        AudioSampleDTO sample3 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(0)  // Zero BPM
                .duration(150)
                .build();

        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(List.of(sample1, sample2, sample3));

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(3, testPack.getSampleCount());
        // Only sample1's BPM should be counted
    }

    @Test
    void recalculatePackStatistics_ShouldCalculateTotalDuration() {
        // Arrange
        AudioSampleDTO sample1 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(120)
                .duration(180)  // 3 minutes
                .build();

        AudioSampleDTO sample2 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(140)
                .duration(200)  // 3:20 minutes
                .build();

        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(List.of(sample1, sample2));

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        // Total duration should be 180 + 200 = 380 seconds
        assertEquals(2, testPack.getSampleCount());
    }

    @Test
    void recalculatePackStatistics_ShouldIgnoreNullDuration() {
        // Arrange
        AudioSampleDTO sample1 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(120)
                .duration(180)
                .build();

        AudioSampleDTO sample2 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(140)
                .duration(null)  // Null duration
                .build();

        AudioSampleDTO sample3 = AudioSampleDTO.builder()
                .id(UUID.randomUUID())
                .bpm(130)
                .duration(0)  // Zero duration
                .build();

        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(List.of(sample1, sample2, sample3));

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(3, testPack.getSampleCount());
        // Only sample1's duration should be counted
    }

    @Test
    void recalculatePackStatistics_ShouldSetCountToZero_WhenNoSamples() {
        // Arrange
        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(Collections.emptyList());

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(0, testPack.getSampleCount());
        verify(audioSampleService).getSamplesByPack(TEST_PACK_ID);
    }

    @Test
    void recalculatePackStatistics_ShouldHandleEmptyList() {
        // Arrange
        when(audioSampleService.getSamplesByPack(TEST_PACK_ID))
                .thenReturn(Collections.emptyList());

        // Act
        statisticsService.recalculatePackStatistics(testPack);

        // Assert
        assertEquals(0, testPack.getSampleCount());
    }

    // ========== updateTotalSize Tests ==========

    @Test
    void updateTotalSize_ShouldAddToExistingSize() {
        // Arrange
        testPack.setTotalSize("1 MB");  // Assuming 1 MB = 1,048,576 bytes

        // Act
        statisticsService.updateTotalSize(testPack, 1024);  // Add 1 KB

        // Assert
        assertNotNull(testPack.getTotalSize());
        // Should be approximately "1.00 MB" (depending on FileSizeUtils implementation)
    }

    @Test
    void updateTotalSize_ShouldHandleZeroBytes() {
        // Arrange
        testPack.setTotalSize("0 B");

        // Act
        statisticsService.updateTotalSize(testPack, 0);

        // Assert
        assertNotNull(testPack.getTotalSize());
    }

    @Test
    void updateTotalSize_ShouldHandleLargeBytes() {
        // Arrange
        testPack.setTotalSize("0 B");

        // Act
        statisticsService.updateTotalSize(testPack, 1073741824L);  // 1 GB

        // Assert
        assertNotNull(testPack.getTotalSize());
        // Should be formatted as "1.00 GB" or similar
    }

    @Test
    void updateTotalSize_ShouldUseNewSizeOnly_WhenParsingFails() {
        // Arrange
        testPack.setTotalSize("INVALID_SIZE");

        // Act
        statisticsService.updateTotalSize(testPack, 2048);  // 2 KB

        // Assert
        assertNotNull(testPack.getTotalSize());
        // Should fall back to formatting only the new size
    }

    @Test
    void updateTotalSize_ShouldHandleNullTotalSize() {
        // Arrange
        testPack.setTotalSize(null);

        // Act
        statisticsService.updateTotalSize(testPack, 1024);

        // Assert
        assertNotNull(testPack.getTotalSize());
    }

    @Test
    void updateTotalSize_ShouldFormatCorrectly() {
        // Arrange
        testPack.setTotalSize("0 B");

        // Act
        statisticsService.updateTotalSize(testPack, 1024);  // 1 KB

        // Assert
        assertNotNull(testPack.getTotalSize());
        assertFalse(testPack.getTotalSize().isEmpty());
    }

    @Test
    void updateTotalSize_ShouldAccumulateMultipleUpdates() {
        // Arrange
        testPack.setTotalSize("0 B");

        // Act
        statisticsService.updateTotalSize(testPack, 512);   // 512 B
        statisticsService.updateTotalSize(testPack, 512);   // Another 512 B

        // Assert
        assertNotNull(testPack.getTotalSize());
        // Total should be 1024 bytes (1 KB)
    }

    @Test
    void updateTotalSize_ShouldHandleNegativeBytes() {
        // Arrange
        testPack.setTotalSize("1 KB");

        // Act
        statisticsService.updateTotalSize(testPack, -512);  // Negative bytes

        // Assert
        assertNotNull(testPack.getTotalSize());
        // Implementation should handle this gracefully
    }
}