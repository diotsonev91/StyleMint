// DesignSummaryDTO.java
package bg.softuni.stylemint.product.fashion.dto;

import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
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
public class DesignSummaryDTO {
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
}