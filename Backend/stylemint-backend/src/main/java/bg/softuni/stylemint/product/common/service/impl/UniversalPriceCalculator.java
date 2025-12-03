package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.common.service.EnhancedDiscountService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Universal price calculator for ALL product types
 * Delegates all discount logic to EnhancedDiscountService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UniversalPriceCalculator implements PriceCalculatorService<BaseProduct> {

    private final EnhancedDiscountService discountService;

    @Override
    public double calculatePrice(BaseProduct product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        UUID userId = getCurrentUserId();

        if (userId == null) {
            return product.getPrice();
        }

        return discountService.calculateFinalPrice(product, userId);
    }

    /**
     * Consume one-time discount after order
     */
    public RewardType consumeOneTimeDiscount(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        RewardType usedDiscount = discountService.useBestDiscount(userId);

        if (usedDiscount != null) {
            log.info("✅ Consumed {} discount for user {}", usedDiscount, userId);
        }

        return usedDiscount;
    }

    /**
     * Get discount info for display
     */
    public EnhancedDiscountService.DiscountInfo getDiscountInfo(BaseProduct product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        UUID userId = getCurrentUserId();

        if (userId == null) {
            return EnhancedDiscountService.DiscountInfo.builder()
                    .basePrice(product.getPrice())
                    .finalPrice(product.getPrice())
                    .productSpecificDiscount(0.0)
                    .nftDiscount(0.0)
                    .oneTimeDiscount(0.0)
                    .totalDiscountPercentage(0.0)
                    .build();
        }

        return discountService.getDiscountInfo(userId, product);
    }

    private UUID getCurrentUserId() {
        try {
            return SecurityUtil.getCurrentUserId();
        } catch (Exception e) {
            log.debug("No authenticated user");
            return null;
        }
    }
}