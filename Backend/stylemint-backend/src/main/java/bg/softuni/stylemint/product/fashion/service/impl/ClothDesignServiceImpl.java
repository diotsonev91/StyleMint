// ClothDesignServiceImpl.java
package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import bg.softuni.stylemint.product.fashion.exceptions.*;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.util.UserRolesService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ClothDesignServiceImpl implements ClothDesignService {

    private final ClothDesignRepository clothDesignRepository;
    private final PriceCalculatorService<ClothDesign> clothPriceCalculator;
    private final ClothLikeService clothLikeService;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;
    private final UserRolesService userRolesService;
    private final FashionPriceProperties priceProperties;

    @Autowired
    public ClothDesignServiceImpl(ClothDesignRepository clothDesignRepository,
                                  @Qualifier("fashionPriceCalculatorService") PriceCalculatorService<ClothDesign> clothPriceCalculator,
                                  ClothLikeService clothLikeService,
                                  CloudinaryService cloudinaryService,
                                  ObjectMapper objectMapper,
                                  UserRolesService userRolesService, FashionPriceProperties priceProperties) {
        this.clothDesignRepository = clothDesignRepository;
        this.clothPriceCalculator = clothPriceCalculator;
        this.clothLikeService = clothLikeService;
        this.cloudinaryService = cloudinaryService;
        this.objectMapper = objectMapper;
        this.userRolesService = userRolesService;
        this.priceProperties = priceProperties;
    }

    @Override
    public long countDesignsByUser(UUID userId) {
        return this.clothDesignRepository.countByUserId(userId);
    }

    @Override
    @Transactional
    public DesignPublicDTO createDesign(DesignUploadRequestDTO request, Boolean autosave) {

        UUID currentUserId = SecurityUtil.getCurrentUserId();

        try {
            ClothDesign design = ClothDesign.builder()
                    .userId(currentUserId)
                    .label(request.getLabel())
                    .clothType(request.getClothType())
                    .customizationType(request.getCustomizationType())
                    .customizationJson(request.getCustomizationJson())
                    .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                    .bonusPoints(request.getCustomizationType().getBonusPoints())
                    .salesCount(0L)
                    .build();


            if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
                processCustomDecalFile(request.getCustomDecalFile(), design, currentUserId);
            }

            double basePrice = priceProperties.getBasePrice(design.getClothType());
            double price = basePrice * priceProperties.getComplexityMultiplier(design.getCustomizationType());

            design.setPrice(price);
            design.setAutoSaved(autosave);
            ClothDesign savedDesign = clothDesignRepository.save(design);

            userRolesService.addRoleToUser(currentUserId, UserRole.DESIGNER);

            return toPublicDTO(savedDesign, 0);

        } catch (Exception e) {
            log.error("Failed to create cloth design", e);
            throw new ClothDesignUploadException("Failed to create design: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public DesignPublicDTO updateDesign(UUID designId, DesignUploadRequestDTO request) {

        UUID currentUserId = SecurityUtil.getCurrentUserId();

        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(currentUserId)) {
            throw new ForbiddenOperationException("Not authorized to update this design");
        }

        try {
            boolean needsPriceRecalculation = false;

            if (request.getLabel() != null) {
                design.setLabel(request.getLabel());
            }
            if (request.getClothType() != null) {
                design.setClothType(request.getClothType());
                needsPriceRecalculation = true;
            }
            if (request.getCustomizationType() != null) {
                design.setCustomizationType(request.getCustomizationType());
            }
            if (request.getCustomizationJson() != null) {
                design.setCustomizationJson(request.getCustomizationJson());
            }
            if (request.getIsPublic() != null) {
                design.setIsPublic(request.getIsPublic());
            }
            if (request.getCustomizationType() != null) {
                design.setCustomizationType(request.getCustomizationType());
                design.setBonusPoints(request.getCustomizationType().getBonusPoints());
                needsPriceRecalculation = true;
            }

            if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
                processCustomDecalFile(request.getCustomDecalFile(), design, currentUserId);
                needsPriceRecalculation = true;
            }

            if (needsPriceRecalculation) {
                double newPrice = clothPriceCalculator.calculatePrice(design);
                design.setPrice(newPrice);
            }

            ClothDesign updatedDesign = clothDesignRepository.save(design);
            return toPublicDTO(updatedDesign);

        } catch (Exception e) {
            log.error("Failed to update cloth design", e);
            throw new ClothDesignProcessingException("Failed to update design: " + e.getMessage(), e);
        }
    }


    private void processCustomDecalFile(MultipartFile customDecalFile, ClothDesign design, UUID userId) {
        try {
            log.info("Processing custom decal file: {} for design: {}",
                    customDecalFile.getOriginalFilename(), design.getId());

            Map<String, Object> uploadResult = cloudinaryService.uploadImage(customDecalFile, userId);

            String imageUrl = (String) uploadResult.get("url");
            design.setCustomDecalPath(imageUrl);

            log.info("Successfully uploaded custom decal to Cloudinary: {}", imageUrl);

        } catch (Exception e) {
            log.error("Failed to process custom decal file", e);
            throw new ClothDesignValidationException("Failed to process custom decal: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteDesign(UUID designId) {

        UUID userId = SecurityUtil.getCurrentUserId();
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to delete this design");
        }

        try {
            if (design.getCustomDecalPath() != null && !design.getCustomDecalPath().isBlank()) {
                cloudinaryService.deleteFile(design.getCustomDecalPath());
            }

            clothDesignRepository.delete(design);

            long remainingDesigns = clothDesignRepository.countByUserId(userId);

            clothLikeService.deleteAllLikesForDesign(design.getId());

            if (remainingDesigns == 0) {
                userRolesService.removeRoleFromUser(userId, UserRole.DESIGNER);
                log.info("User {} no longer has designs, DESIGNER role removed.", userId);
            }
        } catch (Exception e) {
            log.error("Failed to delete cloth design", e);
            throw new ClothDesignProcessingException("Failed to delete design: " + e.getMessage(), e);
        }
    }

    @Override
    public DesignDetailDTO getDesignById(UUID designId) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));
        return toDetailDTO(design);
    }

    @Override
    public List<DesignDetailDTO> getUserDesigns(UUID userId) {
        return clothDesignRepository.findUserNonAutosaveDesigns(userId)
                .stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }


    @Override
    public Page<DesignPublicDTO> getPublicDesigns(Pageable pageable) {
        return clothDesignRepository.findByIsPublic(true, pageable)
                .map(this::toPublicDTO);
    }

    @Override
    public UserDesignerSummaryDTO getUserDesignerSummary(UUID userId) {
        try {
            long totalDesigns = clothDesignRepository.countByUserId(userId);
            long publicDesigns = clothDesignRepository.countByUserIdAndIsPublic(userId, true);
            long privateDesigns = totalDesigns - publicDesigns;

            Long totalSales = 0L;
            Double revenue = 0.0;

            return UserDesignerSummaryDTO.builder()
                    .totalDesigns(totalDesigns)
                    .publicDesigns(publicDesigns)
                    .privateDesigns(privateDesigns)
                    .totalSales(totalSales)
                    .revenue(revenue)
                    .build();
        } catch (Exception e) {
            log.error("Failed to get user designer summary", e);
            throw new ClothDesignProcessingException("Failed to get designer summary: " + e.getMessage(), e);
        }
    }

    public DesignPublicDTO toPublicDTO(ClothDesign design, long likesCount) {

        boolean likedByUser = clothLikeService.isLikedByUser(design.getId());

        // Parse customizationJson to JsonNode
        JsonNode customizationData = null;
        if (design.getCustomizationJson() != null) {
            try {
                customizationData = objectMapper.readTree(design.getCustomizationJson());
            } catch (Exception e) {
                log.error("Failed to parse customizationJson for design {}: {}", design.getId(), e.getMessage());
                throw new CustomizationProcessingException("Failed to parse customization data: " + e.getMessage(), e);
            }
        }
        return DesignPublicDTO.builder()
                .id(design.getId())
                .label(design.getLabel())
                .clothType(design.getClothType())
                .customizationType(design.getCustomizationType())
                .previewImageUrl(generatePreviewImageUrl(design))
                .isPublic(design.getIsPublic())
                .price(design.getPrice())
                .bonusPoints(design.getBonusPoints())
                .salesCount(design.getSalesCount() != null ? design.getSalesCount() : 0L)
                .likesCount(likesCount)
                .createdAt(design.getCreatedAt())
                .isLikedByUser(likedByUser)
                .customizationData(customizationData)
                .customDecalUrl(design.getCustomDecalPath()) // ← Вече е Cloudinary URL
                .build();
    }

    public DesignPublicDTO toPublicDTO(ClothDesign design) {
        long likesCount = clothLikeService.getLikesCount(design.getId());
        return toPublicDTO(design, likesCount);
    }

    private String generatePreviewImageUrl(ClothDesign design) {
        return "/api/v1/designs/" + design.getId() + "/preview";
    }

    public DesignDetailDTO toDetailDTO(ClothDesign design) {
        long likesCount = clothLikeService.getLikesCount(design.getId());

        // Parse customizationJson to JsonNode
        JsonNode customizationData = null;
        if (design.getCustomizationJson() != null) {
            try {
                customizationData = objectMapper.readTree(design.getCustomizationJson());
            } catch (Exception e) {
                log.error("Failed to parse customizationJson for design {}: {}", design.getId(), e.getMessage());
                throw new CustomizationProcessingException("Failed to parse customization data: " + e.getMessage(), e);
            }
        }

        return DesignDetailDTO.builder()
                .id(design.getId())
                .label(design.getLabel())
                .clothType(design.getClothType())
                .customizationType(design.getCustomizationType())
                .previewImageUrl(generatePreviewImageUrl(design))
                .isPublic(design.getIsPublic())
                .price(design.getPrice())
                .bonusPoints(design.getBonusPoints())
                .salesCount(design.getSalesCount() != null ? design.getSalesCount() : 0L)
                .likesCount(likesCount)
                .createdAt(design.getCreatedAt())
                .customizationData(customizationData)
                .customDecalUrl(design.getCustomDecalPath()) // ← Вече е Cloudinary URL
                .build();
    }

    @Override
    public Page<DesignPublicDTO> getAllByClothType(Pageable pageable, ClothType clothType) {

        Page<ClothDesign> clothDesignPage = clothDesignRepository.findByClothType(clothType, pageable);

        return clothDesignPage.map(this::toPublicDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DesignPublicDTO> getPublicDesignsOfUser(UUID userId, Pageable pageable) {
        log.debug("Fetching public designs for user: {} with pageable: {}", userId, pageable);

        Page<ClothDesign> publicDesigns = clothDesignRepository.findByUserIdAndIsPublicTrue(userId, pageable);

        return publicDesigns.map(this::toPublicDTO);
    }

    @Override
    @Transactional
    public void deleteDesignsByUser(UUID targetUserId) {

        List<ClothDesign> designs = clothDesignRepository.findByUserId(targetUserId);

        if (designs.isEmpty()) {
            log.info("No designs to delete for user {}", targetUserId);
            return;
        }

        log.info("User {} → deleting {} cloth designs", targetUserId, designs.size());

        for (ClothDesign design : designs) {

            if (design.getCustomDecalPath() != null && !design.getCustomDecalPath().isBlank()) {
                try {
                    cloudinaryService.deleteFile(design.getCustomDecalPath());
                } catch (Exception e) {
                    log.warn("Failed to delete decal for design {}: {}", design.getId(), e.getMessage());
                }
            }

            clothLikeService.deleteAllLikesForDesign(design.getId());

            clothDesignRepository.delete(design);

            log.info("Deleted cloth design {}", design.getId());
        }

        if (clothDesignRepository.countByUserId(targetUserId) == 0) {
            userRolesService.removeRoleFromUser(targetUserId, UserRole.DESIGNER);
            log.info("Removed DESIGNER role from user {} (no designs left)", targetUserId);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void adminDeleteDesign(UUID designId) {

        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        try {
            if (design.getCustomDecalPath() != null && !design.getCustomDecalPath().isBlank()) {
                cloudinaryService.deleteFile(design.getCustomDecalPath());
            }

            clothDesignRepository.delete(design);

            log.info("❌ ADMIN deleted cloth design {}", designId);

        } catch (Exception e) {
            log.error("Failed to delete cloth design by admin", e);
            throw new ClothDesignProcessingException(
                    "Admin failed to delete design: " + e.getMessage(), e
            );
        }
    }

    @Override
    @Transactional
    public void publishDesign(UUID designId) {
        UUID userId = SecurityUtil.getCurrentUserId();

        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to publish this design");
        }
        if(design.getCustomizationType().equals(CustomizationType.SIMPLE)){
            design.setBonusPoints(20);
        }

        design.setIsPublic(true);
        clothDesignRepository.save(design);

        log.info("Design {} published by user {}", designId, userId);
    }

    @Override
    @Transactional
    public void unpublishDesign(UUID designId) {
        UUID userId = SecurityUtil.getCurrentUserId();

        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to unpublish this design");
        }

        design.setIsPublic(false);
        clothDesignRepository.save(design);

        log.info("Design {} unpublished by user {}", designId, userId);
    }

}