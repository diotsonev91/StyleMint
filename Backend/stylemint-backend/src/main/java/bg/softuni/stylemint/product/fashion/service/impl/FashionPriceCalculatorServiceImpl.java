package bg.softuni.stylemint.product.fashion.service.impl;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.product.common.service.impl.BasePriceCalculatorService;
import bg.softuni.stylemint.product.common.service.impl.BonusPointsService;
import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

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
    private final BonusPointsService bonusPointsService;

    public FashionPriceCalculatorServiceImpl(
            NftServiceFacade nftServiceFacade,
            DiscountService discountService,
            FashionPriceProperties priceProperties, BonusPointsService bonusPointsService) {
        super(nftServiceFacade, discountService);
        this.priceProperties = priceProperties;

        this.bonusPointsService = bonusPointsService;
    }

    /**
     * Calculate base price for cloth with its bonus Discounts tight to cloths specific discounts
     *
     * Formula: (BASE_PRICE * CUSTOMIZATION_TYPE_COMPLEXITY_MULTIPLIER)
     */
    @Override
    protected double calculateBasePrice(ClothDesign product) {

        double base = getBasePriceForClothType(product.getClothType());

        // 1. Complexity multiplier
        double complexity = product.getCustomizationType().getPriceFactor();

        return base * complexity;
    }


    @Override
    public double getProductSpecificDiscount(ClothDesign product, UUID userId) {
        int totalPoints = bonusPointsService.getUserBonusPoints(userId);
        return priceProperties.getBonusDiscount(totalPoints);
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
        return priceProperties.getBasePrice(clothType);
    }
}