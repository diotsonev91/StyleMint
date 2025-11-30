package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import bg.softuni.stylemint.product.fashion.exceptions.ClothDesignNotFoundException;
import bg.softuni.stylemint.product.fashion.exceptions.ClothDesignProcessingException;
import bg.softuni.stylemint.product.fashion.exceptions.ClothDesignUploadException;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.util.UserRolesService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClothDesignServiceImplTest {

    @Mock
    private ClothDesignRepository clothDesignRepository;

    @Mock
    private PriceCalculatorService clothPriceCalculator;

    @Mock
    private ClothLikeService clothLikeService;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private UserRolesService userRolesService;

    @Mock
    private FashionPriceProperties priceProperties;

    @InjectMocks
    private ClothDesignServiceImpl clothDesignService;

    @Captor
    private ArgumentCaptor<ClothDesign> clothDesignCaptor;

    private UUID userId;
    private UUID designId;
    private ClothDesign design;
    private DesignUploadRequestDTO uploadRequest;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        designId = UUID.randomUUID();

        design = ClothDesign.builder()
                .id(designId)
                .userId(userId)
                .label("Test Design")
                .clothType(ClothType.T_SHIRT_SPORT)
                .customizationType(CustomizationType.SIMPLE)
                .customizationJson("{\"color\":\"red\"}")
                .isPublic(false)
                .bonusPoints(20)
                .price(29.99)
                .salesCount(0L)
                .createdAt(OffsetDateTime.now())
                .build();

        uploadRequest = DesignUploadRequestDTO.builder()
                .label("Test Design")
                .clothType(ClothType.T_SHIRT_SPORT)
                .customizationType(CustomizationType.SIMPLE)
                .customizationJson("{\"color\":\"red\"}")
                .isPublic(false)
                .bonusPoints(20)
                .build();
    }

    @Test
    void createDesign_ShouldCreateDesignSuccessfully() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(priceProperties.getBasePrice(ClothType.T_SHIRT_SPORT)).thenReturn(25.0);
            when(priceProperties.getComplexityMultiplier(CustomizationType.SIMPLE)).thenReturn(1.2);
            when(clothDesignRepository.save(any(ClothDesign.class))).thenReturn(design);
            when(clothLikeService.isLikedByUser(designId)).thenReturn(false);

            // Act
            DesignPublicDTO result = clothDesignService.createDesign(uploadRequest, false);

            // Assert
            assertNotNull(result);
            assertEquals(designId, result.getId());
            verify(clothDesignRepository).save(clothDesignCaptor.capture());
            verify(userRolesService).addRoleToUser(userId, UserRole.DESIGNER);

            ClothDesign savedDesign = clothDesignCaptor.getValue();
            assertEquals(userId, savedDesign.getUserId());
            assertEquals("Test Design", savedDesign.getLabel());
        }
    }

    @Test
    void createDesign_WithCustomDecal_ShouldProcessFile() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            uploadRequest.setCustomDecalFile(mockFile);

            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(priceProperties.getBasePrice(ClothType.T_SHIRT_SPORT)).thenReturn(25.0);
            when(priceProperties.getComplexityMultiplier(CustomizationType.SIMPLE)).thenReturn(1.2);
            when(mockFile.isEmpty()).thenReturn(false);
            when(cloudinaryService.uploadImage(mockFile, userId))
                    .thenReturn(Map.of("url", "http://cloudinary.com/image.jpg"));
            when(clothDesignRepository.save(any(ClothDesign.class))).thenReturn(design);
            when(clothLikeService.isLikedByUser(designId)).thenReturn(false);

            // Act
            DesignPublicDTO result = clothDesignService.createDesign(uploadRequest, false);

            // Assert
            assertNotNull(result);
            verify(cloudinaryService).uploadImage(mockFile, userId);
        }
    }

    @Test
    void createDesign_WhenException_ShouldThrowClothDesignUploadException() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.save(any(ClothDesign.class))).thenThrow(new RuntimeException("DB Error"));

            // Act & Assert
            assertThrows(ClothDesignUploadException.class,
                    () -> clothDesignService.createDesign(uploadRequest, false));
        }
    }

    @Test
    void updateDesign_ShouldUpdateDesignSuccessfully() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));
            when(clothPriceCalculator.calculatePrice(design)).thenReturn(35.99);
            when(clothDesignRepository.save(design)).thenReturn(design);
            when(clothLikeService.getLikesCount(designId)).thenReturn(5L);
            when(clothLikeService.isLikedByUser(designId)).thenReturn(false);

            DesignUploadRequestDTO updateRequest = DesignUploadRequestDTO.builder()
                    .label("Updated Design")
                    .clothType(ClothType.HOODIE)
                    .build();

            // Act
            DesignPublicDTO result = clothDesignService.updateDesign(designId, updateRequest);

            // Assert
            assertNotNull(result);
            assertEquals("Updated Design", design.getLabel());
            verify(clothDesignRepository).save(design);
        }
    }

    @Test
    void updateDesign_WhenNotOwner_ShouldThrowForbiddenOperationException() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            UUID otherUserId = UUID.randomUUID();
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(otherUserId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));

            // Act & Assert
            assertThrows(ForbiddenOperationException.class,
                    () -> clothDesignService.updateDesign(designId, uploadRequest));
        }
    }

    @Test
    void updateDesign_WhenDesignNotFound_ShouldThrowClothDesignNotFoundException() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ClothDesignNotFoundException.class,
                    () -> clothDesignService.updateDesign(designId, uploadRequest));
        }
    }

    @Test
    void deleteDesign_ShouldDeleteDesignSuccessfully() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));
            when(clothDesignRepository.countByUserId(userId)).thenReturn(5L);

            // Act
            clothDesignService.deleteDesign(designId);

            // Assert
            verify(clothDesignRepository).delete(design);
            verify(clothLikeService).deleteAllLikesForDesign(designId);
        }
    }

    @Test
    void deleteDesign_WithCustomDecal_ShouldDeleteFromCloudinary() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            design.setCustomDecalPath("http://cloudinary.com/image.jpg");
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));
            when(clothDesignRepository.countByUserId(userId)).thenReturn(5L);

            // Act
            clothDesignService.deleteDesign(designId);

            // Assert
            verify(cloudinaryService).deleteFile("http://cloudinary.com/image.jpg");
        }
    }

    @Test
    void deleteDesign_WhenLastDesign_ShouldRemoveDesignerRole() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));
            when(clothDesignRepository.countByUserId(userId)).thenReturn(0L);

            // Act
            clothDesignService.deleteDesign(designId);

            // Assert
            verify(userRolesService).removeRoleFromUser(userId, UserRole.DESIGNER);
        }
    }

    @Test
    void getDesignById_ShouldReturnDesignDetailDTO() {
        // Arrange
        when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));
        when(clothLikeService.getLikesCount(designId)).thenReturn(10L);

        // Act
        DesignDetailDTO result = clothDesignService.getDesignById(designId);

        // Assert
        assertNotNull(result);
        assertEquals(designId, result.getId());
    }

    @Test
    void getDesignById_WhenNotFound_ShouldThrowException() {
        // Arrange
        when(clothDesignRepository.findById(designId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ClothDesignNotFoundException.class,
                () -> clothDesignService.getDesignById(designId));
    }

    @Test
    void getUserDesigns_ShouldReturnListOfDesigns() {
        // Arrange
        List<ClothDesign> designs = Arrays.asList(design);
        when(clothDesignRepository.findUserNonAutosaveDesigns(userId)).thenReturn(designs);
        when(clothLikeService.getLikesCount(designId)).thenReturn(5L);

        // Act
        List<DesignDetailDTO> result = clothDesignService.getUserDesigns(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getPublicDesigns_ShouldReturnPageOfDesigns() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<ClothDesign> designPage = new PageImpl<>(Arrays.asList(design));
        when(clothDesignRepository.findByIsPublic(true, pageable)).thenReturn(designPage);
        when(clothLikeService.getLikesCount(designId)).thenReturn(5L);
        when(clothLikeService.isLikedByUser(designId)).thenReturn(false);

        // Act
        Page<DesignPublicDTO> result = clothDesignService.getPublicDesigns(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getUserDesignerSummary_ShouldReturnSummary() {
        // Arrange
        when(clothDesignRepository.countByUserId(userId)).thenReturn(10L);
        when(clothDesignRepository.countByUserIdAndIsPublic(userId, true)).thenReturn(7L);

        // Act
        UserDesignerSummaryDTO result = clothDesignService.getUserDesignerSummary(userId);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getTotalDesigns());
        assertEquals(7L, result.getPublicDesigns());
        assertEquals(3L, result.getPrivateDesigns());
    }

    @Test
    void publishDesign_ShouldSetDesignToPublic() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));

            // Act
            clothDesignService.publishDesign(designId);

            // Assert
            assertTrue(design.getIsPublic());
            verify(clothDesignRepository).save(design);
        }
    }

    @Test
    void unpublishDesign_ShouldSetDesignToPrivate() {
        try (MockedStatic<SecurityUtil> securityUtilMock = mockStatic(SecurityUtil.class)) {
            // Arrange
            design.setIsPublic(true);
            securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(userId);
            when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));

            // Act
            clothDesignService.unpublishDesign(designId);

            // Assert
            assertFalse(design.getIsPublic());
            verify(clothDesignRepository).save(design);
        }
    }

    @Test
    void adminDeleteDesign_ShouldDeleteDesign() {
        // Arrange
        when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));

        // Act
        clothDesignService.adminDeleteDesign(designId);

        // Assert
        verify(clothDesignRepository).delete(design);
    }

    @Test
    void adminDeleteDesign_WithCustomDecal_ShouldDeleteFromCloudinary() {
        // Arrange
        design.setCustomDecalPath("http://cloudinary.com/image.jpg");
        when(clothDesignRepository.findById(designId)).thenReturn(Optional.of(design));

        // Act
        clothDesignService.adminDeleteDesign(designId);

        // Assert
        verify(cloudinaryService).deleteFile("http://cloudinary.com/image.jpg");
    }

    @Test
    void countDesignsByUser_ShouldReturnCount() {
        // Arrange
        long expectedCount = 5L;
        when(clothDesignRepository.countByUserId(userId)).thenReturn(expectedCount);

        // Act
        long result = clothDesignService.countDesignsByUser(userId);

        // Assert
        assertEquals(expectedCount, result);
    }
}