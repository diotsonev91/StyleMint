package bg.softuni.stylemint.product.fashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Обобщена информация за дизайнер (автор на cloth дизайни)
 * Използва се в профила на потребителя и в админ панели.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDesignerSummaryDTO {

    /**
     * Общо създадени дизайни (всички – публични и частни)
     */
    private Long totalDesigns;

    /**
     * Брой публични дизайни (пуснати за продажба)
     */
    private Long publicDesigns;

    /**
     * Брой частни дизайни (само за потребителя)
     */
    private Long privateDesigns;

    /**
     * Брой продажби (ако имаш marketplace логика)
     */
    private Long totalSales;

    /**
     * Общ приход от продажби
     */
    private Double revenue;
}
