// DesignUploadRequestDTO.java
package bg.softuni.stylemint.product.fashion.dto;

import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DesignUploadRequestDTO {
    private String label;
    private ClothType clothType;
    private CustomizationType customizationType;
    private String customizationJson;
    private Boolean isPublic;
    private Integer bonusPoints;
    private MultipartFile customDecalFile;
}