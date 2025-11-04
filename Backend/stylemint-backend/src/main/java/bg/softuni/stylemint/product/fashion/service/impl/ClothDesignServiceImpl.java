// ClothDesignServiceImpl.java
package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.common.service.FileService;
import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
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



    @Autowired
    public ClothDesignServiceImpl(ClothDesignRepository clothDesignRepository,
                                  @Qualifier("fashionPriceCalculatorService") PriceCalculatorService<ClothDesign> clothPriceCalculator, ClothLikeService clothLikeService, FileService fileService) {
        this.clothDesignRepository = clothDesignRepository;
        this.clothPriceCalculator = clothPriceCalculator;
        this.clothLikeService = clothLikeService;
        this.fileService = fileService;
    }

    @Override
    public long countDesignsByUser(UUID userId) {
        return this.clothDesignRepository.countByUserId(userId);
    }

    @Override
    @Transactional
    public DesignSummaryDTO createDesign(UUID userId, DesignUploadRequestDTO request) {

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

        double calculatedPrice = clothPriceCalculator.calculatePrice(
                design
        );

        design.setPrice(calculatedPrice);

        if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
            processCustomDecalFile(request.getCustomDecalFile(), design,  userId);
        }

        ClothDesign savedDesign = clothDesignRepository.save(design);
        return toSummaryDTO(savedDesign, 0);
    }

    @Override
    @Transactional
    public DesignSummaryDTO updateDesign(UUID designId, UUID userId, DesignUploadRequestDTO request) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new NotFoundException("Design not found"));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to update this design");
        }

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


        if (needsPriceRecalculation) {
            double newPrice = clothPriceCalculator.calculatePrice(
                    design
            );
            design.setPrice(newPrice);
        }


        if (request.getCustomDecalFile() != null && !request.getCustomDecalFile().isEmpty()) {
            processCustomDecalFile(request.getCustomDecalFile(), design, userId);
        }

        ClothDesign updatedDesign = clothDesignRepository.save(design);
        return toSummaryDTO(updatedDesign);
    }

    private void processCustomDecalFile(MultipartFile customDecalFile, ClothDesign design, UUID userId) {
        log.info("Processing custom decal file: {} for design: {}",
                customDecalFile.getOriginalFilename(), design.getId());

        fileService.processFile(
                customDecalFile,
                "decals",               // категория
                userId,                 // user folder
                design.getCustomDecalPath(), // текущият път (стар файл)
                design::setCustomDecalPath   // setter за entity-то
        );
    }


    @Override
    @Transactional
    public void deleteDesign(UUID designId, UUID userId) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new NotFoundException("Design not found"));

        if (!design.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Not authorized to delete this design");
        }

        // Delete custom decal via FileService if have custom decal if null will not do anything
        fileService.deleteFile(design.getCustomDecalPath());

        // Delete design from DB
        clothDesignRepository.delete(design);
    }


    @Override
    public DesignSummaryDTO getDesignById(UUID designId) {
        ClothDesign design = clothDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));
        return toSummaryDTO(design);
    }

    @Override
    public List<DesignSummaryDTO> getUserDesigns(UUID userId) {
        return clothDesignRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<DesignSummaryDTO> getPublicDesigns(Pageable pageable) {
        return clothDesignRepository.findByIsPublic(true, pageable)
                .map(this::toSummaryDTO);
    }

    @Override
    public UserDesignerSummaryDTO getUserDesignerSummary(UUID userId) {
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
}