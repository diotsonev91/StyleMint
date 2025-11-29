package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.UserNftsResponse;
import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

/**
 * Base implementation of PriceCalculatorService with discount logic
 *
 * Handles two types of discounts:
 * 1. NFT Discounts (permanent while holding NFT):
 *    - NFT_DISCOUNT_5: 5% discount
 *    - NFT_DISCOUNT_7: 7% discount
 * 2. One-time Discounts (consumed after use):
 *    - DISCOUNT_20: 20% one-time discount
 *    - DISCOUNT_40: 40% one-time discount
 *
 * Discount priority:
 * 1. NFT discounts (permanent, applied first)
 * 2. One-time discounts (consumed after use)
 *
 */
@Slf4j
@RequiredArgsConstructor
public abstract class BasePriceCalculatorService<T extends BaseProduct> implements PriceCalculatorService<T> {

    private final NftServiceFacade nftServiceFacade;
    private final DiscountService discountService;


    public double getProductSpecificDiscount(T product, UUID userId) {
        return 0.0; // default: no discount for generic products
    }

    /**
     * Calculate final price with all applicable discounts
     *
     * @param product Product to calculate price for
     * @return Final price after discounts
     */
    @Override
    public final double calculatePrice(T product) {
        double basePrice = calculateBasePrice(product);

        UUID userId = getCurrentUserId();
        if (userId == null) {
            return basePrice;
        }

        // 1. NFT discount
        double nftDiscount = getNftDiscountPercentage(userId);
        double priceAfterNft = basePrice * (1 - nftDiscount);

        // 2. Product-specific discount (override in fashion)
        double productDiscount = getProductSpecificDiscount(product, userId);
        double priceAfterProductDiscount = priceAfterNft * (1 - productDiscount);

        // 3. One-time discount
        double oneTimeDiscount = discountService.getBestDiscountPercentage(userId);
        double finalPrice = priceAfterProductDiscount * (1 - oneTimeDiscount);

        return finalPrice;
    }


    /**
     * Subclasses must implement this to calculate base price without discounts
     *
     * @param product Product to calculate price for
     * @return Base price before any discounts
     */
    protected abstract double calculateBasePrice(T product);

    /**
     * Get NFT discount percentage for user
     * Checks user's NFTs for discount types
     *
     * @param userId User ID
     * @return Discount percentage (0.05 for 5%, 0.07 for 7%, 0.0 for no discount)
     */
    private double getNftDiscountPercentage(UUID userId) {
        try {
            UserNftsResponse nfts = nftServiceFacade.getUserNfts(userId);

            if (nfts == null || nfts.getNfts() == null || nfts.getNfts().isEmpty()) {
                return 0.0;
            }

            // Check for 7% discount first (higher priority)
            boolean has7Percent = nfts.getNfts().stream()
                    .anyMatch(nft -> nft.getNftType() == NftType.NFT_DISCOUNT_7);

            if (has7Percent) {
                log.debug("User {} has NFT_DISCOUNT_7", userId);
                return 0.07;
            }

            // Check for 5% discount
            boolean has5Percent = nfts.getNfts().stream()
                    .anyMatch(nft -> nft.getNftType() == NftType.NFT_DISCOUNT_5);

            if (has5Percent) {
                log.debug("User {} has NFT_DISCOUNT_5", userId);
                return 0.05;
            }

            return 0.0;

        } catch (Exception e) {
            log.warn("Failed to check NFT discounts for user {}: {}", userId, e.getMessage());
            return 0.0;
        }
    }

    /**
     * Get current authenticated user ID
     * Returns null if no user is authenticated
     *
     * @return User ID or null
     */
    private UUID getCurrentUserId() {
        try {
            return SecurityUtil.getCurrentUserId();
        } catch (Exception e) {
            log.debug("No authenticated user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Consume one-time discount for user after order creation
     * Called from order service after successful order
     *
     * @param userId User ID
     * @return Used discount type, or null if no discount was used
     */
    public RewardType consumeOneTimeDiscount(UUID userId) {
        RewardType usedDiscount = discountService.useBestDiscount(userId);

        if (usedDiscount != null) {
            log.info("✅ Consumed {} discount for user {}", usedDiscount, userId);
        }

        return usedDiscount;
    }

}