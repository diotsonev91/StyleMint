package bg.softuni.stylemint.product.fashion.dto;

import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO, което представя обобщена информация за потребителски дизайн.
 * Използва се както в профила на потребителя, така и в страницата за продажби.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignSummaryDTO {

    private UUID id;

    private String label;

    private ClothType clothType;

    private CustomizationType customizationType;

    /**
     * Thumbnail изображение (ако имаш image preview от клиента)
     */
    private String previewImageUrl;

    /**
     * Дали дизайнът е публичен (пуснат за продажба)
     */
    private boolean isPublic;

    /**
     * Цена на дизайна (ако е публичен)
     */
    private Double price;

    /**
     * Обобщена статистика – колко пъти е закупен/харесан
     */
    private Long salesCount;

    private Long likesCount;

    private OffsetDateTime createdAt;
}
