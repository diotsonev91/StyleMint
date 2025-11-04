// ClothDesignService.java
package bg.softuni.stylemint.product.fashion.service;

import bg.softuni.stylemint.product.fashion.dto.*;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ClothDesignService {
    long countDesignsByUser(UUID userId);

    DesignSummaryDTO createDesign(UUID userId, DesignUploadRequestDTO request);

    DesignSummaryDTO updateDesign(UUID designId, UUID userId, DesignUploadRequestDTO request);

    void deleteDesign(UUID designId, UUID userId);

    // ПРЕМАХВАМЕ publish/unpublish методите - ползваме updateDesign
    DesignSummaryDTO getDesignById(UUID designId);

    List<DesignSummaryDTO> getUserDesigns(UUID userId);

    Page<DesignSummaryDTO> getPublicDesigns(Pageable pageable);

    UserDesignerSummaryDTO getUserDesignerSummary(UUID userId);

    DesignSummaryDTO toSummaryDTO(ClothDesign design, long likesCount);

    DesignSummaryDTO toSummaryDTO(ClothDesign design);
}