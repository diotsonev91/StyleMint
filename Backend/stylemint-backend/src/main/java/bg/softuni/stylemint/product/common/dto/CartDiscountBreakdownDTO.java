package bg.softuni.stylemint.product.common.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Complete cart discount breakdown
 * Contains item-level breakdowns and cart-level totals
 */
@Data
@Builder
public class CartDiscountBreakdownDTO {
    private List<ItemDiscountBreakdownDTO> items;

    // Cart-level totals
    private Double cartBasePrice;          // Sum of all base prices
    private Double cartFinalPrice;         // Sum of all final prices
    private Double totalSavings;           // cartBasePrice - cartFinalPrice
    private Double totalSavingsPercent;    // (totalSavings / cartBasePrice)
}