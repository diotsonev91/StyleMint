package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.PackLicense;
import bg.softuni.stylemint.product.audio.model.SampleLicense;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.PackLicenseRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLicenseRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.utils.AudioSampleMapper;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DigitalLicenseServiceImplTest {

    @Mock
    private PackLicenseRepository packLicenseRepository;

    @Mock
    private SampleLicenseRepository sampleLicenseRepository;

    @Mock
    private AudioSampleRepository audioSampleRepository;

    @Mock
    private SamplePackRepository samplePackRepository;

    @Mock
    private OrderServiceFacade orderServiceFacade;

    @Mock
    private UserService userService;

    @Mock
    private AudioSampleMapper audioSampleMapper;

    @InjectMocks
    private DigitalLicenseServiceImpl digitalLicenseService;

    @Captor
    private ArgumentCaptor<SampleLicense> sampleLicenseCaptor;

    @Captor
    private ArgumentCaptor<PackLicense> packLicenseCaptor;

    private UUID userId;
    private UUID sampleId;
    private UUID packId;
    private UUID orderItemId;
    private User user;
    private AudioSample audioSample;
    private SamplePack samplePack;
    private OrderItemDTO sampleOrderItem;
    private OrderItemDTO packOrderItem;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleId = UUID.randomUUID();
        packId = UUID.randomUUID();
        orderItemId = UUID.randomUUID();

        user = new User();
        user.setId(userId);

        audioSample = new AudioSample();
        audioSample.setId(sampleId);
        audioSample.setAuthorId(userId);

        samplePack = new SamplePack();
        samplePack.setId(packId);
        samplePack.setSamples(List.of(audioSample));

        sampleOrderItem = new OrderItemDTO();
        sampleOrderItem.setProductType(ProductType.SAMPLE);
        sampleOrderItem.setProductId(sampleId);
        sampleOrderItem.setItemId(orderItemId);

        packOrderItem = new OrderItemDTO();
        packOrderItem.setProductType(ProductType.PACK);
        packOrderItem.setProductId(packId);
        packOrderItem.setItemId(orderItemId);
    }

    /* ==========================================================
       CREATE LICENSE FOR PAID ITEM TESTS
       ========================================================== */

    @Test
    void createLicenseForPaidItem_WithSample_CreatesSampleLicense() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)).thenReturn(false);
        when(userService.getUserById(userId)).thenReturn(user);

        // Act
        digitalLicenseService.createLicenseForPaidItem(userId, sampleOrderItem);

        // Assert
        verify(sampleLicenseRepository).save(sampleLicenseCaptor.capture());
        SampleLicense savedLicense = sampleLicenseCaptor.getValue();

        assertThat(savedLicense.getUser()).isEqualTo(user);
        assertThat(savedLicense.getAudioSample()).isEqualTo(audioSample);
        assertThat(savedLicense.getOrderItemId()).isEqualTo(orderItemId);
        assertThat(savedLicense.isArchived()).isFalse();
        assertThat(savedLicense.getPurchasedAt()).isNotNull();
    }

    @Test
    void createLicenseForPaidItem_WithSample_WhenLicenseExists_DoesNotCreateDuplicate() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)).thenReturn(true);

        // Act
        digitalLicenseService.createLicenseForPaidItem(userId, sampleOrderItem);

        // Assert
        verify(sampleLicenseRepository, never()).save(any(SampleLicense.class));
    }

    @Test
    void createLicenseForPaidItem_WithPack_CreatesPackAndSampleLicenses() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackId(userId, packId)).thenReturn(false);
        when(userService.getUserById(userId)).thenReturn(user);
        when(samplePackRepository.fetchPackWithSamples(packId)).thenReturn(samplePack);
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)).thenReturn(false);

        // Act
        digitalLicenseService.createLicenseForPaidItem(userId, packOrderItem);

        // Assert
        verify(packLicenseRepository).save(packLicenseCaptor.capture());
        verify(sampleLicenseRepository).save(sampleLicenseCaptor.capture());

        PackLicense savedPackLicense = packLicenseCaptor.getValue();
        assertThat(savedPackLicense.getUser()).isEqualTo(user);
        assertThat(savedPackLicense.getPackId()).isEqualTo(packId);
        assertThat(savedPackLicense.getOrderItemId()).isEqualTo(orderItemId);
        assertThat(savedPackLicense.isArchived()).isFalse();

        SampleLicense savedSampleLicense = sampleLicenseCaptor.getValue();
        assertThat(savedSampleLicense.getAudioSample()).isEqualTo(audioSample);
    }

    @Test
    void createLicenseForPaidItem_WithPack_WhenPackNotFound_ThrowsNotFoundException() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackId(userId, packId)).thenReturn(false);
        when(userService.getUserById(userId)).thenReturn(user);
        when(samplePackRepository.fetchPackWithSamples(packId)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.createLicenseForPaidItem(userId, packOrderItem))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Sample pack not found: " + packId);
    }

    /* ==========================================================
       DOWNLOAD VALIDATION TESTS
       ========================================================== */

    @Test
    void validateDownloadPermissionSample_WhenUserIsAuthor_AllowsAccess() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        audioSample.setAuthorId(userId); // User is the author

        // Act & Assert - Should not throw exception
        digitalLicenseService.validateDownloadPermissionSample(userId, sampleId);
    }

    @Test
    void validateDownloadPermissionSample_WhenUserHasLicense_AllowsAccess() {
        // Arrange
        UUID differentAuthorId = UUID.randomUUID();
        audioSample.setAuthorId(differentAuthorId);

        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleIdAndArchivedFalse(userId, sampleId)).thenReturn(true);

        // Act & Assert - Should not throw exception
        digitalLicenseService.validateDownloadPermissionSample(userId, sampleId);
    }

    @Test
    void validateDownloadPermissionSample_WhenUserNoLicense_ThrowsForbiddenOperationException() {
        // Arrange
        UUID differentAuthorId = UUID.randomUUID();
        audioSample.setAuthorId(differentAuthorId);

        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.of(audioSample));
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleIdAndArchivedFalse(userId, sampleId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.validateDownloadPermissionSample(userId, sampleId))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessage("You must purchase this sample before downloading it.");
    }

    @Test
    void validateDownloadPermissionSample_WhenSampleNotFound_ThrowsNotFoundException() {
        // Arrange
        when(audioSampleRepository.findById(sampleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.validateDownloadPermissionSample(userId, sampleId))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Sample with ID " + sampleId + " does not exist.");
    }

    @Test
    void validateDownloadPermissionPack_WhenUserHasLicense_AllowsAccess() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackIdAndArchivedFalse(userId, packId)).thenReturn(true);

        // Act & Assert - Should not throw exception
        digitalLicenseService.validateDownloadPermissionPack(userId, packId);
    }

    @Test
    void validateDownloadPermissionPack_WhenUserNoLicense_ThrowsForbiddenOperationException() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackIdAndArchivedFalse(userId, packId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.validateDownloadPermissionPack(userId, packId))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessage("You must purchase this pack before downloading it.");
    }

    /* ==========================================================
       LIBRARY TESTS
       ========================================================== */

    @Test
    void getUserSampleLibrary_ReturnsUserSamples() {
        // Arrange
        List<AudioSample> samples = List.of(audioSample);
        AudioSampleDTO sampleDTO = new AudioSampleDTO();

        when(sampleLicenseRepository.findAudioSamplesByUserIdAndArchivedFalse(userId)).thenReturn(samples);
        when(audioSampleMapper.toDTO(audioSample)).thenReturn(sampleDTO);

        // Act
        List<AudioSampleDTO> result = digitalLicenseService.getUserSampleLibrary(userId);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(sampleDTO);
        verify(audioSampleMapper).toDTO(audioSample);
    }

    @Test
    void getUserLicenses_ReturnsUserLicenses() {
        // Arrange
        SampleLicense license = new SampleLicense();
        when(sampleLicenseRepository.findByUserId(userId)).thenReturn(List.of(license));

        // Act
        List<SampleLicense> result = digitalLicenseService.getUserLicenses(userId);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(license);
    }

    /* ==========================================================
       DELETE LICENSE TESTS
       ========================================================== */

    @Test
    void deleteSampleLicense_WhenLicenseExists_ArchivesLicense() {
        // Arrange
        SampleLicense license = SampleLicense.builder()
                .user(user)
                .audioSample(audioSample)
                .archived(false)
                .build();

        when(sampleLicenseRepository.findByUserIdAndAudioSampleId(userId, sampleId))
                .thenReturn(Optional.of(license));

        // Act
        digitalLicenseService.deleteSampleLicense(userId, sampleId);

        // Assert
        verify(sampleLicenseRepository).save(sampleLicenseCaptor.capture());
        SampleLicense savedLicense = sampleLicenseCaptor.getValue();

        assertThat(savedLicense.isArchived()).isTrue();
        assertThat(savedLicense.getArchivedAt()).isNotNull();
    }

    @Test
    void deleteSampleLicense_WhenLicenseNotFound_ThrowsNotFoundException() {
        // Arrange
        when(sampleLicenseRepository.findByUserIdAndAudioSampleId(userId, sampleId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.deleteSampleLicense(userId, sampleId))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("License not found");
    }

    @Test
    void deletePackLicense_WhenLicenseExists_ArchivesLicense() {
        // Arrange
        PackLicense license = PackLicense.builder()
                .user(user)
                .packId(packId)
                .archived(false)
                .build();

        when(packLicenseRepository.findByUserIdAndPackId(userId, packId))
                .thenReturn(Optional.of(license));

        // Act
        digitalLicenseService.deletePackLicense(userId, packId);

        // Assert
        verify(packLicenseRepository).save(packLicenseCaptor.capture());
        PackLicense savedLicense = packLicenseCaptor.getValue();

        assertThat(savedLicense.isArchived()).isTrue();
        assertThat(savedLicense.getArchivedAt()).isNotNull();
    }

    @Test
    void deletePackLicense_WhenLicenseNotFound_ThrowsNotFoundException() {
        // Arrange
        when(packLicenseRepository.findByUserIdAndPackId(userId, packId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> digitalLicenseService.deletePackLicense(userId, packId))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Pack license not found");
    }

    /* ==========================================================
       EDGE CASE TESTS
       ========================================================== */

    @Test
    void createLicenseForPaidItem_WithPack_WhenSampleLicenseAlreadyExists_DoesNotCreateDuplicate() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackId(userId, packId)).thenReturn(false);
        when(userService.getUserById(userId)).thenReturn(user);
        when(samplePackRepository.fetchPackWithSamples(packId)).thenReturn(samplePack);
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)).thenReturn(true);

        // Act
        digitalLicenseService.createLicenseForPaidItem(userId, packOrderItem);

        // Assert
        verify(packLicenseRepository).save(any(PackLicense.class)); // Pack license should be created
        verify(sampleLicenseRepository, never()).save(any(SampleLicense.class)); // But not sample license (already exists)
    }

    @Test
    void createLicenseForPaidItem_WithPack_WhenPackLicenseAlreadyExists_DoesNotCreateDuplicate() {
        // Arrange
        when(packLicenseRepository.existsByUserIdAndPackId(userId, packId)).thenReturn(true);
        when(samplePackRepository.fetchPackWithSamples(packId)).thenReturn(samplePack);
        when(sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)).thenReturn(false);

        // Act
        digitalLicenseService.createLicenseForPaidItem(userId, packOrderItem);

        // Assert
        verify(packLicenseRepository, never()).save(any(PackLicense.class)); // Pack license already exists
        verify(sampleLicenseRepository).save(any(SampleLicense.class)); // But sample licenses should be created
    }
}