package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.exceptions.AudioFileValidationException;
import bg.softuni.stylemint.product.audio.exceptions.AudioProcessingException;
import bg.softuni.stylemint.product.audio.exceptions.AudioSampleNotFoundException;
import bg.softuni.stylemint.product.audio.exceptions.AudioUploadException;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import bg.softuni.stylemint.product.audio.service.utils.AudioSampleMapper;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.util.UserRolesService;
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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AudioSampleServiceImplTest {

    @Mock
    private AudioSampleRepository audioSampleRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private AudioSampleMapper audioSampleMapper;

    @Mock
    private UserRolesService userRolesService;

    @InjectMocks
    private AudioSampleServiceImpl audioSampleService;

    private UUID authorId;
    private UUID sampleId;
    private AudioSample audioSample;
    private AudioSampleDTO audioSampleDTO;
    private UploadSampleRequest uploadRequest;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        sampleId = UUID.randomUUID();

        audioSample = AudioSample.builder()
                .id(sampleId)
                .authorId(authorId)
                .name("Test Sample")
                .artist("Test Artist")
                .audioUrl("http://audio.url/sample.mp3")
                .duration(120)
                .bpm(140)
                .key(MusicalKey.C)
                .scale(MusicalScale.MAJOR)
                .genre(Genre.HIP_HOP)
                .instrumentGroup(InstrumentGroup.DRUMS)
                .sampleType(SampleType.LOOP)
                .price(9.99)
                .tags(Arrays.asList("drum", "loop"))
                .salesCount(0L)
                .archived(false)
                .build();

        audioSampleDTO = AudioSampleDTO.builder()
                .id(sampleId)
                .authorId(authorId)
                .name("Test Sample")
                .artist("Test Artist")
                .audioUrl("http://audio.url/sample.mp3")
                .duration(120)
                .bpm(140)
                .key(MusicalKey.C)
                .scale(MusicalScale.MAJOR)
                .genre(Genre.HIP_HOP)
                .instrumentGroup(InstrumentGroup.DRUMS)
                .sampleType(SampleType.LOOP)
                .price(9.99)
                .tags(Arrays.asList("drum", "loop"))
                .isArchived(false)
                .build();

        uploadRequest = new UploadSampleRequest();
        uploadRequest.setName("Test Sample");
        uploadRequest.setArtist("Test Artist");
        uploadRequest.setBpm(140);
        uploadRequest.setMusicalKey(MusicalKey.C);
        uploadRequest.setMusicalScale(MusicalScale.MAJOR);
        uploadRequest.setGenre(Genre.HIP_HOP);
        uploadRequest.setInstrumentGroup(InstrumentGroup.DRUMS);
        uploadRequest.setSampleType(SampleType.LOOP);
        uploadRequest.setPrice(BigDecimal.valueOf(9.99));
        uploadRequest.setTags(Arrays.asList("drum", "loop"));
    }

    @Test
    void uploadSample_ShouldUploadSuccessfully() {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        uploadRequest.setFile(mockFile);

        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("audio/mpeg");
        when(mockFile.getSize()).thenReturn(1024L);
        when(cloudinaryService.uploadAudio(mockFile, authorId))
                .thenReturn(Map.of("url", "http://audio.url/sample.mp3", "duration", 120.0));
        when(audioSampleRepository.save(any(AudioSample.class))).thenReturn(audioSample);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        AudioSampleDTO result = audioSampleService.uploadSample(authorId, uploadRequest);

        // Assert
        assertNotNull(result);
        assertEquals(sampleId, result.getId());
        verify(cloudinaryService).uploadAudio(mockFile, authorId);
        verify(audioSampleRepository).save(any(AudioSample.class));
        verify(userRolesService).addRoleToUser(authorId, UserRole.AUTHOR);
    }

    @Test
    void uploadSample_WithEmptyFile_ShouldThrowException() {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        uploadRequest.setFile(mockFile);
        when(mockFile.isEmpty()).thenReturn(true);

        // Act & Assert
        assertThrows(AudioFileValidationException.class,
                () -> audioSampleService.uploadSample(authorId, uploadRequest));
    }

    @Test
    void uploadSample_WithInvalidFileType_ShouldThrowException() {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        uploadRequest.setFile(mockFile);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("image/jpeg");

        // Act & Assert
        assertThrows(AudioFileValidationException.class,
                () -> audioSampleService.uploadSample(authorId, uploadRequest));
    }

    @Test
    void updateSample_ShouldUpdateSuccessfully() {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        uploadRequest.setFile(mockFile);

        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("audio/mpeg");
        when(mockFile.getSize()).thenReturn(1024L);
        when(cloudinaryService.uploadAudio(mockFile, authorId))
                .thenReturn(Map.of("url", "http://new.audio.url/sample.mp3", "duration", 130.0));
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        AudioSampleDTO result = audioSampleService.updateSample(sampleId, authorId, uploadRequest);

        // Assert
        assertNotNull(result);
        verify(audioSampleRepository).save(audioSample);
        verify(cloudinaryService).uploadAudio(mockFile, authorId);
    }

    @Test
    void updateSample_WhenNotOwner_ShouldThrowForbiddenOperationException() {
        // Arrange
        UUID otherAuthorId = UUID.randomUUID();
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));

        // Act & Assert
        assertThrows(ForbiddenOperationException.class,
                () -> audioSampleService.updateSample(sampleId, otherAuthorId, uploadRequest));
    }

    @Test
    void updateSample_WhenSampleNotFound_ShouldThrowAudioSampleNotFoundException() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AudioSampleNotFoundException.class,
                () -> audioSampleService.updateSample(sampleId, authorId, uploadRequest));
    }

    @Test
    void updateSampleMetadata_ShouldUpdateMetadataSuccessfully() {
        // Arrange
        UpdateSampleRequest updateRequest = new UpdateSampleRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setArtist("Updated Artist");
        updateRequest.setBpm(150);
        updateRequest.setMusicalKey(MusicalKey.D);
        updateRequest.setMusicalScale(MusicalScale.MINOR);
        updateRequest.setGenre(Genre.TRAP);
        updateRequest.setInstrumentGroup(InstrumentGroup.BASS);
        updateRequest.setSampleType(SampleType.ONESHOT);
        updateRequest.setPrice(BigDecimal.valueOf(12.99));
        updateRequest.setTags(Arrays.asList("bass", "oneshot"));

        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        AudioSampleDTO result = audioSampleService.updateSampleMetadata(sampleId, authorId, updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Name", audioSample.getName());
        assertEquals("Updated Artist", audioSample.getArtist());
        assertEquals(150, audioSample.getBpm());
        verify(audioSampleRepository).save(audioSample);
    }

    @Test
    void getSampleById_ShouldReturnSample() {
        // Arrange
        when(audioSampleRepository.findByIdAndArchivedFalse(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        AudioSampleDTO result = audioSampleService.getSampleById(sampleId);

        // Assert
        assertNotNull(result);
        assertEquals(sampleId, result.getId());
    }

    @Test
    void getSampleById_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(audioSampleRepository.findByIdAndArchivedFalse(sampleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AudioSampleNotFoundException.class,
                () -> audioSampleService.getSampleById(sampleId));
    }

    @Test
    void getSamplesByAuthor_ShouldReturnAuthorSamples() {
        // Arrange
        List<AudioSample> samples = Arrays.asList(audioSample);
        when(audioSampleRepository.findByAuthorIdAndArchivedFalse(authorId)).thenReturn(samples);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        List<AudioSampleDTO> result = audioSampleService.getSamplesByAuthor(authorId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(audioSampleRepository).findByAuthorIdAndArchivedFalse(authorId);
    }

    @Test
    void getSamplesByGenre_ShouldReturnGenreSamples() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<AudioSample> samplePage = new PageImpl<>(Arrays.asList(audioSample));
        when(audioSampleRepository.findByGenreAndArchivedFalse(Genre.HIP_HOP, pageable)).thenReturn(samplePage);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        Page<AudioSampleDTO> result = audioSampleService.getSamplesByGenre(Genre.HIP_HOP, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void archiveSample_ShouldArchiveSuccessfully() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleRepository.countByAuthorId(authorId)).thenReturn(5L);
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);

        // Act
        audioSampleService.archiveSample(sampleId, authorId);

        // Assert
        assertTrue(audioSample.isArchived());
        assertNotNull(audioSample.getArchivedAt());
        verify(audioSampleRepository).save(audioSample);
        verify(userRolesService, never()).removeRoleFromUser(any(), any());
    }

    @Test
    void archiveSample_WhenLastSample_ShouldRemoveAuthorRole() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleRepository.countByAuthorId(authorId)).thenReturn(0L);
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);

        // Act
        audioSampleService.archiveSample(sampleId, authorId);

        // Assert
        verify(userRolesService).removeRoleFromUser(authorId, UserRole.AUTHOR);
    }

    @Test
    void adminArchiveSample_ShouldArchiveAsAdmin() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);

        // Act
        audioSampleService.adminArchiveSample(sampleId);

        // Assert
        assertTrue(audioSample.isArchived());
        assertNotNull(audioSample.getArchivedAt());
        verify(audioSampleRepository).save(audioSample);
    }

    @Test
    void updateSamplePrice_ShouldUpdatePrice() {
        // Arrange
        Double newPrice = 14.99;
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(audioSampleRepository.save(audioSample)).thenReturn(audioSample);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        AudioSampleDTO result = audioSampleService.updateSamplePrice(sampleId, authorId, newPrice);

        // Assert
        assertNotNull(result);
        assertEquals(newPrice, audioSample.getPrice());
        verify(audioSampleRepository).save(audioSample);
    }

    @Test
    void countSamplesByAuthor_ShouldReturnCount() {
        // Arrange
        long expectedCount = 5L;
        when(audioSampleRepository.countByAuthorIdAndArchivedFalse(authorId)).thenReturn(expectedCount);

        // Act
        long result = audioSampleService.countSamplesByAuthor(authorId);

        // Assert
        assertEquals(expectedCount, result);
    }

    @Test
    void searchSamples_ShouldReturnFilteredResults() {
        // Arrange
        AudioSampleSearchRequest searchRequest = new AudioSampleSearchRequest();
        searchRequest.setGenre(Genre.HIP_HOP);
        searchRequest.setSampleType(SampleType.LOOP);
        searchRequest.setMinBpm(100);
        searchRequest.setMaxBpm(160);

        Pageable pageable = PageRequest.of(0, 10);
        Page<AudioSample> samplePage = new PageImpl<>(Arrays.asList(audioSample));

        when(audioSampleRepository.searchSamples(
                eq(Genre.HIP_HOP), eq(SampleType.LOOP), eq(100), eq(160),
                isNull(), isNull(), eq(pageable))).thenReturn(samplePage);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(audioSampleDTO);

        // Act
        Page<AudioSampleDTO> result = audioSampleService.searchSamples(searchRequest, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}