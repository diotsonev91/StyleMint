// PriceConfigController.java
package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.dto.PriceConfigDTO;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

/**
 * REST Controller for price configuration
 *
 * Provides frontend with base prices, multipliers, and discount information
 *
 * Endpoints:
 * - GET /api/v1/prices/config - Full price configuration
 * - GET /api/v1/prices/base - Base prices only
 */
@Slf4j
@RestController
@RequestMapping(BASE +"/prices")
@RequiredArgsConstructor
public class PriceConfigController {

    private final FashionPriceProperties priceProperties;

    /**
     * Get complete price configuration
     *
     * Returns:
     * - Base prices by cloth type
     * - Custom decal premium
     * - Bonus multiplier tiers
     * - Available discounts
     *
     * Used by: Frontend for price preview in designer/cart
     */
    @GetMapping("/config")
    public PriceConfigDTO getPriceConfig() {
        log.debug("Fetching complete price configuration");

        return PriceConfigDTO.builder()
                .basePrices(getBasePricesMap())
                .bonusTiers(getBonusTiers())
                .discounts(getDiscounts())
                .build();
    }

    /**
     * Get base prices only (lightweight endpoint)
     *
     * Used by: Frontend for quick price display
     */
    @GetMapping("/base")
    public Map<String, Double> getBasePrices() {
        log.debug("Fetching base prices");
        return getBasePricesMap();
    }

    /**
     * Get bonus multiplier tiers
     *
     * Used by: Frontend to display designer tier benefits
     */
    @GetMapping("/bonus-tiers")
    public List<PriceConfigDTO.BonusTierDTO> getBonusTiers() {
        return List.of(
                PriceConfigDTO.BonusTierDTO.builder()
                        .minPoints(100)
                        .multiplier(0.90) // 10% discount
                        .description("Master Designer - 40% discount")
                        .build(),
                PriceConfigDTO.BonusTierDTO.builder()
                        .minPoints(40)
                        .multiplier(0.95) // 5% discount
                        .description("Advanced Designer - 15% discount")
                        .build(),
                PriceConfigDTO.BonusTierDTO.builder()
                        .minPoints(20)
                        .multiplier(0.98) // 2% discount
                        .description("Regular Designer - 5% discount")
                        .build(),
                PriceConfigDTO.BonusTierDTO.builder()
                        .minPoints(0)
                        .multiplier(1.00) // no discount
                        .description("customer - no discount")
                        .build()
        );
    }


    /**
     * Get available discount types
     *
     * Used by: Frontend to display discount information
     */
    @GetMapping("/discounts")
    public List<PriceConfigDTO.DiscountInfoDTO> getDiscounts() {
        log.debug("Fetching discount information");

        return List.of(
                PriceConfigDTO.DiscountInfoDTO.builder()
                        .type("NFT_DISCOUNT_5")
                        .percentage(0.05)
                        .description("5% permanent discount while holding NFT")
                        .permanent(true)
                        .build(),
                PriceConfigDTO.DiscountInfoDTO.builder()
                        .type("NFT_DISCOUNT_7")
                        .percentage(0.07)
                        .description("7% permanent discount while holding NFT")
                        .permanent(true)
                        .build(),
                PriceConfigDTO.DiscountInfoDTO.builder()
                        .type("DISCOUNT_20")
                        .percentage(0.20)
                        .description("20% single-use discount")
                        .permanent(false)
                        .build(),
                PriceConfigDTO.DiscountInfoDTO.builder()
                        .type("DISCOUNT_40")
                        .percentage(0.40)
                        .description("40% single-use discount")
                        .permanent(false)
                        .build()
        );
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Convert ClothType enum to base prices map
     *
     * Returns:
     * {
     *   "T_SHIRT_SPORT": 29.99,
     *   "T_SHIRT_CLASSIC": 24.99,
     *   "HOODIE": 49.99,
     *   "CAP": 19.99,
     *   "SHOE": 89.99
     * }
     */
    private Map<String, Double> getBasePricesMap() {
        return Arrays.stream(ClothType.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        priceProperties::getBasePrice
                        )
                );
    }
}