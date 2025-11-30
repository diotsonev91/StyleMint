package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

class AutoSavedDesignCleanupServiceTest {

    @Mock
    private ClothDesignRepository designRepo;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AutoSavedDesignCleanupService cleanupService;

    private OffsetDateTime now;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        now = OffsetDateTime.now();
    }

    @Test
    void cleanupOldAutoSavedDesigns_shouldDeleteOldDesigns() {
        // Arrange
        OffsetDateTime threshold = OffsetDateTime.now().minusDays(30);
        UUID designId = UUID.randomUUID();

        // Мокваме стария дизайн
        ClothDesign oldDesign = ClothDesign.builder()
                .id(designId)
                .autoSaved(true)
                .createdAt(threshold.minusDays(1))  // По-стари от 30 дни
                .customDecalPath("http://cloudinary.com/image.jpg")  // Правилен URL
                .build();

        List<ClothDesign> oldAutoSavedDesigns = Arrays.asList(oldDesign);

        // Мокваме поведение на репозиториото, за да върне старите дизайни
        when(designRepo.findByAutoSavedTrueAndCreatedAtBefore(threshold)).thenReturn(oldAutoSavedDesigns);

        // Act
        cleanupService.cleanupOldAutoSavedDesigns();  // Извикваме метода

        // Assert
        verify(cloudinaryService).deleteFile("http://cloudinary.com/image.jpg");  // Проверяваме дали deleteFile е извикан с правилния URL
        verify(designRepo).delete(oldDesign);  // Проверяваме дали дизайнът е изтрит от репозиториото
    }



    @Test
    void cleanupOldAutoSavedDesigns_shouldDoNothingIfNoOldDesigns() {
        // Arrange
        OffsetDateTime threshold = now.minusDays(30);
        when(designRepo.findByAutoSavedTrueAndCreatedAtBefore(threshold)).thenReturn(Arrays.asList());

        // Act
        cleanupService.cleanupOldAutoSavedDesigns();

        // Assert
        verify(cloudinaryService, never()).deleteFile(anyString());
        verify(designRepo, never()).delete(any(ClothDesign.class));
    }
}
