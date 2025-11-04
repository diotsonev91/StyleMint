package bg.softuni.stylemint.product.fashion.model;

import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "cloth_designs")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ClothDesign extends BaseProduct {

    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "cloth_type", nullable = false, length = 32)
    private ClothType clothType;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "customization_type", nullable = false)
    private CustomizationType customizationType;

    @Lob
    @Column(name = "customization_json", columnDefinition = "json", nullable = false)
    private String customizationJson;

    @Column(name = "label")
    private String label;

    @Column(name = "bonus_points")
    private Integer bonusPoints;

    @Column(name = "isPublic")
    private Boolean isPublic;

    @Column(name = "custom_decal_path")
    private String customDecalPath;

}
