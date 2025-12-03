package bg.softuni.stylemint.product.common.service;

import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.dto.DiscountInfo;
import bg.softuni.stylemint.product.common.model.BaseProduct;

import java.util.List;
import java.util.UUID;

/**
 * Universal discount service handling ALL discount types
 */
public interface EnhancedDiscountService extends DiscountService {

    // NFT Discounts
    double getNftDiscountPercentage(UUID userId);
    default boolean hasNftDiscount(UUID userId) {
        return getNftDiscountPercentage(userId) > 0;
    }
    List<RewardType> getAvailableNftDiscounts(UUID userId);
    boolean hasNftDiscountType(UUID userId, RewardType nftDiscountType);
    RewardType getHighestNftDiscountType(UUID userId);

    // Product-specific discounts (Fashion bonus points, etc.)
    double getProductSpecificDiscount(UUID userId, BaseProduct product);

    // Universal calculation
    double calculateFinalPrice(BaseProduct product, UUID userId);

    // Info
    DiscountInfo getDiscountInfo(UUID userId, BaseProduct product);

}