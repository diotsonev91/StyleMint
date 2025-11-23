// ClothDesignService.java
package bg.softuni.stylemint.product.fashion.service;

import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ClothDesignService {
    long countDesignsByUser(UUID userId);

    DesignPublicDTO createDesign(DesignUploadRequestDTO request);

    DesignPublicDTO updateDesign(UUID userId, DesignUploadRequestDTO request);

    void deleteDesign(UUID designId);

    DesignDetailDTO getDesignById(UUID designId);

    List<DesignDetailDTO> getUserDesigns(UUID userId);

    Page<DesignPublicDTO> getPublicDesigns(Pageable pageable);

    UserDesignerSummaryDTO getUserDesignerSummary(UUID userId);

    DesignPublicDTO toPublicDTO(ClothDesign design, long likesCount);

    DesignPublicDTO toPublicDTO(ClothDesign design);

    Page<DesignPublicDTO> getAllByClothType(Pageable pageable, ClothType clothType);
}