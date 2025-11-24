package bg.softuni.stylemint.product.common.repository;


import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.model.UserDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDiscountRepository extends JpaRepository<UserDiscount, UUID> {

    /**
     * Find all available discounts for user
     */
    List<UserDiscount> findByUserId(UUID userId);

    /**
     * Find specific discount type for user
     */
    Optional<UserDiscount> findByUserIdAndRewardType(UUID userId, RewardType rewardType);

    /**
     * Check if user has any discounts
     */
    boolean existsByUserId(UUID userId);

    /**
     * Count discounts for user
     */
    long countByUserId(UUID userId);

    /**
     * Delete all discounts for user
     */
    void deleteByUserId(UUID userId);

    /**
     * Delete specific discount type for user
     */
    void deleteByUserIdAndRewardType(UUID userId, RewardType rewardType);

    /**
     * Get best (highest) discount for user
     * Returns DISCOUNT_40 if exists, otherwise DISCOUNT_20
     */
    @Query("SELECT d FROM UserDiscount d WHERE d.userId = :userId " +
            "ORDER BY d.rewardType DESC LIMIT 1")
    Optional<UserDiscount> findBestDiscountByUserId(UUID userId);
}