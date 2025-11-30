package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackManagementService;
import bg.softuni.stylemint.product.audio.service.utils.SamplePackMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SamplePackServiceImplTest {

    @Mock
    private SamplePackRepository samplePackRepository;

    @Mock
    private SamplePackManagementService samplePackManagementService;

    @Mock
    private AudioSampleService audioSampleService;

    @Mock
    private SamplePackMapper samplePackMapper;

    @InjectMocks
    private SamplePackServiceImpl samplePackService;

    private UUID authorId;
    private UUID packId;
    private SamplePack samplePack;
    private SamplePackDTO samplePackDTO;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        packId = UUID.randomUUID();

        samplePack = SamplePack.builder()
                .id(packId)
                .authorId(authorId)
                .title("Test Pack")
                .artist("Test Artist")
                .description("Test Description")
                .price(49.99)
                .rating(4.5)
                .downloads(100)
                .genres(Arrays.asList(Genre.HIP_HOP, Genre.TRAP))
                .archived(false)
                .releaseDate(OffsetDateTime.now())
                .build();

        samplePackDTO = SamplePackDTO.builder()
                .id(packId)
                .authorId(authorId)
                .title("Test Pack")
                .artist("Test Artist")
                .description("Test Description")
                .price(49.99)
                .rating(4.5)
                .downloads(100)
                .genres(Arrays.asList(Genre.HIP_HOP, Genre.TRAP))
                .archived(false)
                .releaseDate(OffsetDateTime.now())
                .build();
    }

    @Test
    void uploadPack_ShouldDelegateToManagementService() {
        // Arrange
        UploadPackRequest request = new UploadPackRequest();
        SamplePackDTO expectedResult = samplePackDTO;

        when(samplePackManagementService.uploadPack(authorId, request)).thenReturn(expectedResult);

        // Act
        SamplePackDTO result = samplePackService.uploadPack(authorId, request);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResult, result);
        verify(samplePackManagementService).uploadPack(authorId, request);
    }

    @Test
    void updatePack_ShouldDelegateToManagementService() {
        // Arrange
        UpdatePackRequest request = new UpdatePackRequest();
        request.setTitle("Updated Title");
        SamplePackDTO expectedResult = samplePackDTO;

        when(samplePackManagementService.updatePack(packId, authorId, request)).thenReturn(expectedResult);

        // Act
        SamplePackDTO result = samplePackService.updatePack(packId, authorId, request);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResult, result);
        verify(samplePackManagementService).updatePack(packId, authorId, request);
    }

    @Test
    void getPackById_ShouldReturnPack() {
        // Arrange
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        SamplePackDTO result = samplePackService.getPackById(packId);

        // Assert
        assertNotNull(result);
        assertEquals(packId, result.getId());
        verify(samplePackRepository).findById(packId);
    }

    @Test
    void getPackById_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(samplePackRepository.findById(packId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class,
                () -> samplePackService.getPackById(packId));
    }

    @Test
    void getPackWithSamples_ShouldReturnPackWithSamples() {
        // Arrange
        List<AudioSampleDTO> samples = Arrays.asList(
                AudioSampleDTO.builder().id(UUID.randomUUID()).name("Sample 1").build()
        );

        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(audioSampleService.getSamplesByPack(packId)).thenReturn(samples);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        SamplePackDetailDTO result = samplePackService.getPackWithSamples(packId);

        // Assert
        assertNotNull(result);
        assertEquals(samplePackDTO, result.getPack());
        assertEquals(1, result.getSamples().size());
        verify(samplePackRepository).findById(packId);
        verify(audioSampleService).getSamplesByPack(packId);
    }

    @Test
    void getPacksByAuthor_ShouldReturnAuthorPacks() {
        // Arrange
        List<SamplePack> packs = Arrays.asList(samplePack);
        when(samplePackRepository.findByAuthorIdAndArchivedFalse(authorId)).thenReturn(packs);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.getPacksByAuthor(authorId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findByAuthorIdAndArchivedFalse(authorId);
    }

    @Test
    void getPacksByArtist_ShouldReturnArtistPacks() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<SamplePack> packPage = new PageImpl<>(Arrays.asList(samplePack));
        when(samplePackRepository.findByArtistAndArchivedFalse("Test Artist", pageable)).thenReturn(packPage);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        Page<SamplePackDTO> result = samplePackService.getPacksByArtist("Test Artist", pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(samplePackRepository).findByArtistAndArchivedFalse("Test Artist", pageable);
    }

    @Test
    void getPacksByGenre_ShouldReturnGenrePacks() {
        // Arrange
        List<SamplePack> packs = Arrays.asList(samplePack);
        when(samplePackRepository.findByGenresContainingAndArchivedFalse(Genre.HIP_HOP)).thenReturn(packs);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.getPacksByGenre(Genre.HIP_HOP);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findByGenresContainingAndArchivedFalse(Genre.HIP_HOP);
    }

    @Test
    void getAllPacks_ShouldReturnAllPacks() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<SamplePack> packPage = new PageImpl<>(Arrays.asList(samplePack));
        when(samplePackRepository.findByArchivedFalse(pageable)).thenReturn(packPage);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        Page<SamplePackDTO> result = samplePackService.getAllPacks(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(samplePackRepository).findByArchivedFalse(pageable);
    }

    @Test
    void searchPacks_ShouldReturnFilteredResults() {
        // Arrange
        SamplePackSearchRequest searchRequest = new SamplePackSearchRequest();
        searchRequest.setArtist("Test Artist");
        searchRequest.setGenre(Genre.HIP_HOP);
        searchRequest.setMinPrice(0.0);
        searchRequest.setMaxPrice(100.0);
        searchRequest.setMinRating(4.0);

        Pageable pageable = PageRequest.of(0, 10);
        Page<SamplePack> packPage = new PageImpl<>(Arrays.asList(samplePack));

        when(samplePackRepository.searchPacks(
                eq("Test Artist"), eq(Genre.HIP_HOP), eq(0.0), eq(100.0), eq(4.0), eq(pageable)))
                .thenReturn(packPage);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        Page<SamplePackDTO> result = samplePackService.searchPacks(searchRequest, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void searchPacksByTitle_ShouldReturnTitleMatches() {
        // Arrange
        List<SamplePack> packs = Arrays.asList(samplePack);
        when(samplePackRepository.findByTitleContainingIgnoreCaseAndArchivedFalse("Test")).thenReturn(packs);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.searchPacksByTitle("Test");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findByTitleContainingIgnoreCaseAndArchivedFalse("Test");
    }

    @Test
    void findSimilarPacks_ShouldReturnSimilarPacks() {
        // Arrange
        List<SamplePack> similarPacks = Arrays.asList(samplePack);
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(samplePackRepository.findSimilarPacks(samplePack.getGenres(), packId)).thenReturn(similarPacks);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.findSimilarPacks(packId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findSimilarPacks(samplePack.getGenres(), packId);
    }

    @Test
    void getTopRatedPacks_ShouldReturnTopRated() {
        // Arrange
        List<SamplePack> topPacks = Arrays.asList(samplePack);
        when(samplePackRepository.findTop10ByOrderByRatingDescAndArchivedFalse()).thenReturn(topPacks);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.getTopRatedPacks();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findTop10ByOrderByRatingDescAndArchivedFalse();
    }

    @Test
    void getMostDownloadedPacks_ShouldReturnMostDownloaded() {
        // Arrange
        List<SamplePack> downloadedPacks = Arrays.asList(samplePack);
        when(samplePackRepository.findTop10ByOrderByDownloadsDescAndArchivedFalse()).thenReturn(downloadedPacks);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.getMostDownloadedPacks();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findTop10ByOrderByDownloadsDescAndArchivedFalse();
    }

    @Test
    void getLatestPacks_ShouldReturnLatest() {
        // Arrange
        List<SamplePack> latestPacks = Arrays.asList(samplePack);
        when(samplePackRepository.findTop10ByOrderByReleaseDateDescAndArchivedFalse()).thenReturn(latestPacks);
        when(samplePackMapper.toDTO(samplePack)).thenReturn(samplePackDTO);

        // Act
        List<SamplePackDTO> result = samplePackService.getLatestPacks();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(samplePackRepository).findTop10ByOrderByReleaseDateDescAndArchivedFalse();
    }

    @Test
    void countPacksByAuthor_ShouldReturnCount() {
        // Arrange
        long expectedCount = 5L;
        when(samplePackRepository.countByAuthorId(authorId)).thenReturn(expectedCount);

        // Act
        long result = samplePackService.countPacksByAuthor(authorId);

        // Assert
        assertEquals(expectedCount, result);
        verify(samplePackRepository).countByAuthorId(authorId);
    }

    @Test
    void incrementDownloadCount_ShouldIncrementDownloads() {
        // Arrange
        samplePack.setDownloads(100);
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(samplePackRepository.save(samplePack)).thenReturn(samplePack);

        // Act
        samplePackService.incrementDownloadCount(packId);

        // Assert
        assertEquals(101, samplePack.getDownloads());
        verify(samplePackRepository).save(samplePack);
    }


    @Test
    void getProducerStats_ShouldReturnStats() {
        // Arrange
        long totalSamples = 10L;
        long totalPacks = 3L;
        List<SamplePack> packs = Arrays.asList(
                SamplePack.builder().rating(4.5).downloads(100).build(),
                SamplePack.builder().rating(4.0).downloads(200).build()
        );

        when(audioSampleService.countSamplesByAuthor(authorId)).thenReturn(totalSamples);
        when(samplePackRepository.countByAuthorId(authorId)).thenReturn(totalPacks);
        when(samplePackRepository.findByAuthorIdAndArchivedFalse(authorId)).thenReturn(packs);

        // Act
        ProducerStatsDTO result = samplePackService.getProducerStats(authorId);

        // Assert
        assertNotNull(result);
        assertEquals(totalSamples, result.getTotalSamples());
        assertEquals(totalPacks, result.getTotalPacks());
        assertEquals(4.25, result.getAverageRating()); // (4.5 + 4.0) / 2
        assertEquals(300, result.getTotalDownloads()); // 100 + 200
        verify(audioSampleService).countSamplesByAuthor(authorId);
        verify(samplePackRepository).countByAuthorId(authorId);
    }

    @Test
    void validatePackOwnership_ShouldReturnTrueForOwner() {
        // Arrange
        when(samplePackRepository.existsByIdAndAuthorId(packId, authorId)).thenReturn(true);

        // Act
        boolean result = samplePackService.validatePackOwnership(packId, authorId);

        // Assert
        assertTrue(result);
        verify(samplePackRepository).existsByIdAndAuthorId(packId, authorId);
    }

    @Test
    void validatePackOwnership_ShouldReturnFalseForNonOwner() {
        // Arrange
        UUID otherAuthorId = UUID.randomUUID();
        when(samplePackRepository.existsByIdAndAuthorId(packId, otherAuthorId)).thenReturn(false);

        // Act
        boolean result = samplePackService.validatePackOwnership(packId, otherAuthorId);

        // Assert
        assertFalse(result);
    }

    @Test
    void archivePackByUser_ShouldArchiveSuccessfully() {
        // Arrange
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(samplePackRepository.save(samplePack)).thenReturn(samplePack);

        // Act
        samplePackService.archivePackByUser(packId, authorId);

        // Assert
        assertTrue(samplePack.isArchived());
        assertNotNull(samplePack.getArchivedAt());
        verify(samplePackRepository).save(samplePack);
    }

    @Test
    void archivePackByUser_WhenNotOwner_ShouldThrowException() {
        // Arrange
        UUID otherAuthorId = UUID.randomUUID();
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class,
                () -> samplePackService.archivePackByUser(packId, otherAuthorId));
    }

    @Test
    void adminArchivePack_ShouldArchiveAsAdmin() {
        // Arrange
        when(samplePackRepository.findById(packId)).thenReturn(Optional.of(samplePack));
        when(samplePackRepository.save(samplePack)).thenReturn(samplePack);

        // Act
        samplePackService.adminArchivePack(packId);

        // Assert
        assertTrue(samplePack.isArchived());
        assertNotNull(samplePack.getArchivedAt());
        verify(samplePackRepository).save(samplePack);
    }

    @Test
    void archiveAllByAuthor_ShouldArchiveAllUserPacks() {
        // Arrange
        List<SamplePack> userPacks = Arrays.asList(samplePack);
        when(samplePackRepository.findByAuthorIdAndArchivedFalse(authorId)).thenReturn(userPacks);
        when(samplePackRepository.save(samplePack)).thenReturn(samplePack);

        // Act
        samplePackService.archiveAllByAuthor(authorId);

        // Assert
        assertTrue(samplePack.isArchived());
        assertNotNull(samplePack.getArchivedAt());
        verify(samplePackRepository).save(samplePack);
    }
}