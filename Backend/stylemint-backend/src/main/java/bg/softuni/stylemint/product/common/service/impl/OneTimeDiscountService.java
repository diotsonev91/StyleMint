package bg.softuni.stylemint.product.common.service.impl;


import bg.softuni.stylemint.game.enums.RewardType;


import bg.softuni.stylemint.product.common.model.UserDiscount;
import bg.softuni.stylemint.product.common.repository.UserDiscountRepository;
import bg.softuni.stylemint.product.common.service.DiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for managing one-time discount rewards
 *
 * Handles DISCOUNT_20 and DISCOUNT_40 rewards from games
 * NFT discounts are handled separately by NftServiceFacade
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OneTimeDiscountService implements DiscountService {

    private final UserDiscountRepository discountRepository;

    @Override
    @Transactional
    public void saveDiscount(UUID userId, RewardType rewardType) {
        if (!isValidDiscountType(rewardType)) {
            log.warn("Attempted to save invalid discount type: {}", rewardType);
            throw new IllegalArgumentException("Invalid discount type: " + rewardType);
        }

        // Check if user already has this discount type
        if (discountRepository.findByUserIdAndRewardType(userId, rewardType).isPresent()) {
            log.info("User {} already has discount {}, skipping", userId, rewardType);
            return;
        }

        UserDiscount discount = UserDiscount.builder()
                .userId(userId)
                .rewardType(rewardType)
                .build();

        discountRepository.save(discount);

        log.info("✅ Saved {} discount for user {}", rewardType, userId);
    }

    @Override
    public List<RewardType> getAvailableDiscounts(UUID userId) {
        return discountRepository.findByUserId(userId)
                .stream()
                .map(UserDiscount::getRewardType)
                .collect(Collectors.toList());
    }

    @Override
    public double getBestDiscountPercentage(UUID userId) {
        return discountRepository.findBestDiscountByUserId(userId)
                .map(UserDiscount::getDiscountPercentage)
                .orElse(0.0);
    }

    @Override
    @Transactional
    public RewardType useBestDiscount(UUID userId) {
        return discountRepository.findBestDiscountByUserId(userId)
                .map(discount -> {
                    RewardType rewardType = discount.getRewardType();

                    // Delete the discount after use
                    discountRepository.delete(discount);

                    log.info("✅ Used and deleted {} discount for user {}", rewardType, userId);

                    return rewardType;
                })
                .orElse(null);
    }


    /**
     * Check if reward type is a valid discount (DISCOUNT_20 or DISCOUNT_40)
     */
    private boolean isValidDiscountType(RewardType rewardType) {
        return rewardType == RewardType.DISCOUNT_20 ||
                rewardType == RewardType.DISCOUNT_40;
    }
}