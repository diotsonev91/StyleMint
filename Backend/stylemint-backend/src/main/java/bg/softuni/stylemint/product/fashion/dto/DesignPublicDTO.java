// DesignSummaryDTO.java
package bg.softuni.stylemint.product.fashion.dto;

import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignPublicDTO {
    private UUID id;
    private String label;
    private ClothType clothType;
    private CustomizationType customizationType;
    private String previewImageUrl;
    private boolean isPublic;
    private Double price;
    private Integer bonusPoints;
    private Long salesCount;
    private Long likesCount;
    private OffsetDateTime createdAt;
    private Boolean isLikedByUser;

    // Full customization data (JSON object)
    private JsonNode customizationData;

    // Custom decal URL if exists
    private String customDecalUrl;

}