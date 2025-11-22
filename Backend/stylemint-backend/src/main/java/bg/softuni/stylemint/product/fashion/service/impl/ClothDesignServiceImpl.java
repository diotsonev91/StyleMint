// ClothDesignServiceImpl.java
package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.common.service.FileService;
import bg.softuni.stylemint.product.fashion.dto.*;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service

@Transactional(readOnly = true)
public class ClothDesignServiceImpl implements ClothDesignService {

    private final ClothDesignRepository clothDesignRepository;

    private final PriceCalculatorService<ClothDesign> clothPriceCalculator;

    private final ClothLikeService clothLikeService;

    private final FileService fileService;

    private final ObjectMapper objectMapper;

    private final UserRolesService userRolesService;


    @Autowired
    public ClothDesignServiceImpl(ClothDesignRepository clothDesignRepository,
                                  @Qualifier("fashionPriceCalculatorService") PriceCalculatorService<ClothDesign> clothPriceCalculator, ClothLikeService clothLikeService, FileService fileService, ObjectMapper objectMapper, UserRolesService userRolesService) {
        this.clothDesignRepository = clothDesignRepository;
        this.clothPriceCalculator = clothPriceCalculator;
        this.clothLikeService = clothLikeService;
        this.fileService = fileService;
        this.objectMapper = objectMapper;
        this.userRolesService = userRolesService;
    }

    @Override
    public long countDesignsByUser(UUID userId) {
        return this.clothDesignRepository.countByUserId(userId);
    }

    @Override
    @Transactional
    public DesignSummaryDTO createDesign(UUID userId, DesignUploadRequestDTO request) {
        try {
            ClothDesign design = ClothDesign.builder()
                    .userId(userId)
                    .label(request.getLabel())
                    .clothType(request.getClothType())
                    .customizationType(request.getCustomizationType())
                    .customizationJson(request.getCustomizationJson())
                    .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                    .bonusPoints(request.getBonusPoints() != null ? request.getBonusPoints() : 20)
                    .salesCount(0L)
                    .build();

            // Process custom decal BEFORE calculating price
            if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
                processCustomDecalFile(request.getCustomDecalFile(), design, userId);
            }

            // NOW calculate price (will include custom decal premium if exists)
            double calculatedPrice = clothPriceCalculator.calculatePrice(design);
            design.setPrice(calculatedPrice);

            ClothDesign savedDesign = clothDesignRepository.save(design);

            userRolesService.addRoleToUser(userId, UserRole.DESIGNER);

            return toSummaryDTO(savedDesign, 0);

        } catch (Exception e) {
            log.error("Failed to create cloth design", e);
            throw new ClothDesignUploadException("Failed to create design: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public DesignSummaryDTO updateDesign(UUID designId, UUID userId, DesignUploadRequestDTO request) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(userId)) {
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
            if (request.getBonusPoints() != null) {
                design.setBonusPoints(request.getBonusPoints());
                needsPriceRecalculation = true;
            }

            // Process new custom decal if provided
            if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
                processCustomDecalFile(request.getCustomDecalFile(), design, userId);
                needsPriceRecalculation = true; // Custom decal affects price
            }

            // Recalculate price if needed
            if (needsPriceRecalculation) {
                double newPrice = clothPriceCalculator.calculatePrice(design);
                design.setPrice(newPrice);
            }

            ClothDesign updatedDesign = clothDesignRepository.save(design);
            return toSummaryDTO(updatedDesign);
        }
        catch (Exception e) {
            log.error("Failed to update cloth design", e);
            throw new ClothDesignProcessingException("Failed to update design: " + e.getMessage(), e);
        }
    }

    private void processCustomDecalFile(MultipartFile customDecalFile, ClothDesign design, UUID userId) {
        try {
            log.info("Processing custom decal file: {} for design: {}",
                    customDecalFile.getOriginalFilename(), design.getId());

            fileService.processFile(
                    customDecalFile,
                    "decals",               // категория
                    userId,                 // user folder
                    design.getCustomDecalPath(), // текущият път (стар файл)
                    design::setCustomDecalPath   // setter за entity-то
            );
        } catch (Exception e) {
            log.error("Failed to process custom decal file", e);
            throw new ClothDesignValidationException("Failed to process custom decal: " + e.getMessage(), e);
        }
    }


    @Override
    @Transactional
    public void deleteDesign(UUID designId, UUID userId) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new ClothDesignNotFoundException(designId));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to delete this design");
        }

        try {
            // Delete custom decal file if exists
            fileService.deleteFile(design.getCustomDecalPath());

            // Delete the design from the database
            clothDesignRepository.delete(design);

            // Check if the user still has any designs left
            long remainingDesigns = clothDesignRepository.countByUserId(userId);

            // If no designs left, remove DESIGNER role
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
        return clothDesignRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDetailDTO)  // Changed from toSummaryDTO
                .collect(Collectors.toList());
    }

    @Override
    public Page<DesignSummaryDTO> getPublicDesigns(Pageable pageable) {
        return clothDesignRepository.findByIsPublic(true, pageable)
                .map(this::toSummaryDTO);
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

    public DesignSummaryDTO toSummaryDTO(ClothDesign design, long likesCount) {
        return DesignSummaryDTO.builder()
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
                .build();
    }

    public DesignSummaryDTO toSummaryDTO(ClothDesign design) {
        long likesCount = clothLikeService.getLikesCount(design.getId());
        return toSummaryDTO(design, likesCount);
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
                .customDecalUrl(design.getCustomDecalPath())
                .build();
    }
}