package bg.softuni.stylemint.product.common.service;

import bg.softuni.stylemint.game.enums.RewardType;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing one-time discount rewards from games
 *
 * Discount Types:
 * - DISCOUNT_20: 20% one-time discount
 * - DISCOUNT_40: 40% one-time discount
 *
 * These discounts are:
 * - Saved when claimed from game rewards
 * - Applied once during order creation
 * - Automatically deleted after use
 *
 * NOT handled by this service:
 * - NFT discounts (NFT_DISCOUNT_5, NFT_DISCOUNT_7) - handled by NftServiceFacade
 * - Author badges (AUTHOR_BADGE_PRODUCER, AUTHOR_BADGE_DESIGNER) - NFTs only
 */
public interface DiscountService {

    /**
     * Save a one-time discount reward for user
     * Called from GameService.claimReward() when reward is DISCOUNT_20 or DISCOUNT_40
     *
     * @param userId User ID
     * @param rewardType DISCOUNT_20 or DISCOUNT_40
     */
    void saveDiscount(UUID userId, RewardType rewardType);

    /**
     * Get all available (unused) discounts for user
     *
     * @param userId User ID
     * @return List of available discount types
     */
    List<RewardType> getAvailableDiscounts(UUID userId);

    /**
     * Get best available discount percentage for user
     * Returns 0.0 if no discounts available
     *
     * @param userId User ID
     * @return Discount percentage (0.20 for 20%, 0.40 for 40%)
     */
    double getBestDiscountPercentage(UUID userId);

    /**
     * Use (consume) best available discount for user
     * Automatically deletes the discount after use
     * Called from PriceCalculatorService during order creation
     *
     * @param userId User ID
     * @return Used discount type, or null if no discounts available
     */
    RewardType useBestDiscount(UUID userId);

    /**
     * Check if user has any available discounts
     *
     * @param userId User ID
     * @return true if user has unused discounts
     */
    default boolean hasAvailableDiscounts(UUID userId) {
        return !getAvailableDiscounts(userId).isEmpty();
    }
}