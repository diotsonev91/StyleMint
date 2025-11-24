package bg.softuni.stylemint.product.fashion.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for sending price configuration to frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceConfigDTO {

    /**
     * Base prices by cloth type
     * Example:
     * {
     *   "T_SHIRT_SPORT": 29.99,
     *   "T_SHIRT_CLASSIC": 24.99,
     *   "HOODIE": 49.99,
     *   "CAP": 19.99,
     *   "SHOE": 89.99
     * }
     */
    private Map<String, Double> basePrices;

    /**
     * Custom decal premium price
     * Example: 5.00
     */
    private Double customDecalPremium;

    /**
     * Bonus multiplier tiers
     * Example:
     * [
     *   { "minPoints": 100, "multiplier": 1.30, "description": "Expert Designer" },
     *   { "minPoints": 50, "multiplier": 1.15, "description": "Advanced Designer" },
     *   { "minPoints": 20, "multiplier": 1.00, "description": "Regular Designer" },
     *   { "minPoints": 0, "multiplier": 0.95, "description": "Beginner Designer" }
     * ]
     */
    private List<BonusTierDTO> bonusTiers;

    /**
     * Available discount types
     * Example:
     * [
     *   { "type": "NFT_DISCOUNT_5", "percentage": 0.05, "description": "5% NFT discount" },
     *   { "type": "NFT_DISCOUNT_7", "percentage": 0.07, "description": "7% NFT discount" },
     *   { "type": "DISCOUNT_20", "percentage": 0.20, "description": "20% one-time" },
     *   { "type": "DISCOUNT_40", "percentage": 0.40, "description": "40% one-time" }
     * ]
     */
    private List<DiscountInfoDTO> discounts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BonusTierDTO {
        private Integer minPoints;
        private Double multiplier;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountInfoDTO {
        private String type;
        private Double percentage;
        private String description;
        private Boolean permanent; // true for NFT, false for one-time
    }
}