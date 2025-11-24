// FashionPriceCalculatorServiceImpl.java - UPDATED with Configuration Properties
package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.product.common.service.impl.BasePriceCalculatorService;
import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Fashion Price Calculator with discount support
 *
 * Base prices are loaded from application-prices.yml
 * Additional modifiers:
 * - Bonus points multiplier
 * - Custom decal premium (loaded from config)
 * - NFT discounts (5% or 7%, permanent)
 * - One-time discounts (20% or 40%, consumed after use)
 */
@Slf4j
@Service("fashionPriceCalculatorService")
public class FashionPriceCalculatorServiceImpl extends BasePriceCalculatorService<ClothDesign> {

    private final FashionPriceProperties priceProperties;

    public FashionPriceCalculatorServiceImpl(
            NftServiceFacade nftServiceFacade,
            DiscountService discountService,
            FashionPriceProperties priceProperties) {
        super(nftServiceFacade, discountService);
        this.priceProperties = priceProperties;
    }

    /**
     * Calculate base price before discounts
     *
     * Formula: (BASE_PRICE * BONUS_MULTIPLIER) + CUSTOM_DECAL_PREMIUM
     */
    @Override
    protected double calculateBasePrice(ClothDesign product) {
        // Get base price for cloth type from configuration
        double basePrice = getBasePriceForClothType(product.getClothType());

        // Apply bonus points multiplier from configuration
        double multiplier = priceProperties.getMultiplierForPoints(product.getBonusPoints());

        // Add premium for custom decals from configuration
        double customDecalPremium = (product.getCustomDecalPath() != null)
                ? priceProperties.getCustomDecalPremium()
                : 0.0;

        double calculatedPrice = (basePrice * multiplier) + customDecalPremium;

        log.debug("Calculated base price for {}: base={}, multiplier={}, premium={}, total={}",
                product.getClothType(),
                basePrice,
                multiplier,
                customDecalPremium,
                calculatedPrice);

        return calculatedPrice;
    }

    /**
     * Get base price for cloth type from configuration
     *
     * Maps ClothType enum to configuration key:
     * - T_SHIRT_SPORT -> t-shirt-sport
     * - T_SHIRT_CLASSIC -> t-shirt-classic
     * - HOODIE -> hoodie
     * - CAP -> cap
     * - SHOE -> shoe
     */
    private double getBasePriceForClothType(ClothType clothType) {
        String configKey = clothType.name().toLowerCase().replace("_", "-");
        return priceProperties.getBasePrice(configKey);
    }
}