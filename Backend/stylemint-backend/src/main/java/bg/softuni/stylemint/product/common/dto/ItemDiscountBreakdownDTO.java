package bg.softuni.stylemint.product.common.dto;
import bg.softuni.dtos.enums.payment.ProductType;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

/**
 * Discount breakdown for a single cart item
 * Shows price at each discount stage
 */
@Data
@Builder
public class ItemDiscountBreakdownDTO {
    private UUID productId;
    private ProductType productType;
    private Integer quantity;

    // Price progression
    private Double basePrice;                      // Original price
    private Double priceAfterProductDiscount;      // After fashion bonus points, etc.
    private Double priceAfterNftDiscount;          // After NFT discount (5% or 7%)
    private Double finalPrice;                     // After one-time discount (20% or 40%)

    // Discount percentages
    private Double productSpecificDiscountPercent;  // e.g., 0.10 for 10%
    private Double nftDiscountPercent;              // e.g., 0.05 for 5%
    private Double oneTimeDiscountPercent;          // e.g., 0.20 for 20%
    private Double totalDiscountPercent;            // Total savings as percentage
}