package bg.softuni.stylemint.product.common.model;


import bg.softuni.stylemint.game.enums.RewardType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for storing one-time discount rewards from games
 *
 * These discounts are:
 * - Created when user claims DISCOUNT_20 or DISCOUNT_40 reward from games
 * - Automatically deleted after being used in an order
 * - NOT used for NFT discounts (those are checked via NftServiceFacade)
 */
@Entity
@Table(name = "user_discounts",
        indexes = {
                @Index(name = "idx_user_discount_user", columnList = "user_id"),
                @Index(name = "idx_user_discount_type", columnList = "reward_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", nullable = false, length = 32)
    private RewardType rewardType;

    @Column(name = "claimed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime claimedAt = OffsetDateTime.now();

    /**
     * Get discount percentage as decimal
     * @return 0.20 for DISCOUNT_20, 0.40 for DISCOUNT_40
     */
    public double getDiscountPercentage() {
        return switch (rewardType) {
            case DISCOUNT_20 -> 0.20;
            case DISCOUNT_40 -> 0.40;
            default -> 0.0;
        };
    }
}