package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.dto.CartDiscountBreakdownDTO;
import bg.softuni.stylemint.product.common.dto.DiscountInfo;
import bg.softuni.stylemint.product.common.dto.ItemDiscountBreakdownDTO;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.common.service.EnhancedDiscountService;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UniversalPriceCalculator implements PriceCalculatorService<BaseProduct> {

    private final EnhancedDiscountService discountService;
    private final ProductFetchService productFetchService;

    @Override
    public double calculatePrice(BaseProduct product) {
        validateProduct(product);
        UUID userId = getCurrentUserId();

        return userId != null ?
                discountService.calculateFinalPrice(product, userId) :
                product.getPrice();
    }

    /**
     * Get cart discount breakdown
     */
    public CartDiscountBreakdownDTO getCartDiscountBreakdown(
            UUID userId,
            List<OrderItemRequestDTO> cartItems) {

        validateUserId(userId);
        validateCartItems(cartItems);

        log.info("Calculating cart discount breakdown for {} items for user {}",
                cartItems.size(), userId);

        List<ItemDiscountBreakdownDTO> itemBreakdowns = new ArrayList<>();
        double cartBasePrice = 0.0;
        double cartFinalPrice = 0.0;

        for (OrderItemRequestDTO item : cartItems) {
            BaseProduct product = productFetchService.fetchProduct(item);

            if (product == null) {
                throw new NotFoundException(
                        item.getProductType().name()
                );
            }

            DiscountInfo discountInfo = discountService.getDiscountInfo(userId, product);
            ItemDiscountBreakdownDTO itemBreakdown = buildItemBreakdown(item, discountInfo);
            itemBreakdowns.add(itemBreakdown);

            cartBasePrice += discountInfo.getBasePrice() * item.getQuantity();
            cartFinalPrice += discountInfo.getFinalPrice() * item.getQuantity();
        }

        return buildCartBreakdown(itemBreakdowns, cartBasePrice, cartFinalPrice);
    }

    /**
     * Get discount info for a single product by product type and ID
     */
    public DiscountInfo getProductDiscountInfo(UUID userId, String productType, UUID productId) {
        validateUserId(userId);

        BaseProduct product = productFetchService.fetchProductByTypeAndId(productType, productId);

        if (product == null) {
            throw new NotFoundException(productId.toString());
        }

        return discountService.getDiscountInfo(userId, product);
    }

    /**
     * Get discount info for a single product (with product object)
     */
    public DiscountInfo getProductDiscountInfo(UUID userId, BaseProduct product) {
        validateUserId(userId);
        validateProduct(product);

        return discountService.getDiscountInfo(userId, product);
    }

    /**
     * Get all available discounts for user
     */
    public List<RewardType> getAvailableDiscounts(UUID userId) {
        validateUserId(userId);
        return discountService.getAvailableDiscounts(userId);
    }

    /**
     * Get NFT discount percentage for user
     */
    public double getNftDiscountPercentage(UUID userId) {
        validateUserId(userId);
        return discountService.getNftDiscountPercentage(userId);
    }

    /**
     * Get available NFT discounts for user
     */
    public List<RewardType> getAvailableNftDiscounts(UUID userId) {
        validateUserId(userId);
        return discountService.getAvailableNftDiscounts(userId);
    }

    /**
     * Check if user has any available discounts
     */
    public boolean hasAvailableDiscounts(UUID userId) {
        validateUserId(userId);
        return discountService.hasAvailableDiscounts(userId);
    }

    /**
     * Check if user has specific NFT discount type
     */
    public boolean hasNftDiscountType(UUID userId, RewardType nftDiscountType) {
        validateUserId(userId);
        return discountService.hasNftDiscountType(userId, nftDiscountType);
    }

    /**
     * Get highest NFT discount type for user
     */
    public RewardType getHighestNftDiscountType(UUID userId) {
        validateUserId(userId);
        return discountService.getHighestNftDiscountType(userId);
    }

    /**
     * Consume one-time discount after order
     */
    @Transactional
    public RewardType consumeOneTimeDiscount(UUID userId) {
        validateUserId(userId);

        RewardType usedDiscount = discountService.useBestDiscount(userId);

        if (usedDiscount != null) {
            log.info("Consumed {} discount for user {}", usedDiscount, userId);
        }

        return usedDiscount;
    }

    /**
     * Save discount for user (used by game rewards)
     */
    @Transactional
    public void saveDiscount(UUID userId, RewardType rewardType) {
        validateUserId(userId);
        validateRewardType(rewardType);

        discountService.saveDiscount(userId, rewardType);
        log.info("Saved {} discount for user {}", rewardType, userId);
    }

    /**
     * Get discount info for display (uses current user)
     */
    public DiscountInfo getDiscountInfo(BaseProduct product) {
        validateProduct(product);

        UUID userId = getCurrentUserId();

        if (userId == null) {
            return buildAnonymousDiscountInfo(product.getPrice());
        }

        return discountService.getDiscountInfo(userId, product);
    }

    /**
     * Calculate total price for list of products
     */
    public double calculateTotalPrice(List<BaseProduct> products) {
        if (products == null || products.isEmpty()) {
            return 0.0;
        }

        UUID userId = getCurrentUserId();
        double total = 0.0;

        for (BaseProduct product : products) {
            validateProduct(product);
            total += userId != null ?
                    discountService.calculateFinalPrice(product, userId) :
                    product.getPrice();
        }

        return total;
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private ItemDiscountBreakdownDTO buildItemBreakdown(
            OrderItemRequestDTO item,
            DiscountInfo discountInfo) {

        return ItemDiscountBreakdownDTO.builder()
                .productId(item.getProductId())
                .productType(item.getProductType())
                .quantity(item.getQuantity())
                .basePrice(discountInfo.getBasePrice())
                .priceAfterProductDiscount(
                        discountInfo.getBasePrice() * (1 - discountInfo.getProductSpecificDiscount())
                )
                .priceAfterNftDiscount(
                        discountInfo.getBasePrice() *
                                (1 - discountInfo.getProductSpecificDiscount()) *
                                (1 - discountInfo.getNftDiscount())
                )
                .finalPrice(discountInfo.getFinalPrice())
                .productSpecificDiscountPercent(discountInfo.getProductSpecificDiscount())
                .nftDiscountPercent(discountInfo.getNftDiscount())
                .oneTimeDiscountPercent(discountInfo.getOneTimeDiscount())
                .totalDiscountPercent(discountInfo.getTotalDiscountPercentage())
                .build();
    }

    private CartDiscountBreakdownDTO buildCartBreakdown(
            List<ItemDiscountBreakdownDTO> itemBreakdowns,
            double cartBasePrice,
            double cartFinalPrice) {

        double totalSavings = cartBasePrice - cartFinalPrice;
        double totalSavingsPercent = cartBasePrice > 0 ? totalSavings / cartBasePrice : 0.0;

        CartDiscountBreakdownDTO cartBreakdown = CartDiscountBreakdownDTO.builder()
                .items(itemBreakdowns)
                .cartBasePrice(cartBasePrice)
                .cartFinalPrice(cartFinalPrice)
                .totalSavings(totalSavings)
                .totalSavingsPercent(totalSavingsPercent)
                .build();

        log.info("Cart breakdown calculated: Base={}, Final={}, Savings={} ({}%)",
                cartBasePrice, cartFinalPrice, totalSavings,
                String.format("%.1f", totalSavingsPercent * 100));

        return cartBreakdown;
    }

    private DiscountInfo buildAnonymousDiscountInfo(double price) {
        return DiscountInfo.builder()
                .basePrice(price)
                .finalPrice(price)
                .productSpecificDiscount(0.0)
                .nftDiscount(0.0)
                .oneTimeDiscount(0.0)
                .totalDiscountPercentage(0.0)
                .build();
    }

    // ==================== VALIDATION METHODS ====================

    private void validateUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
    }

    private void validateProduct(BaseProduct product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
    }

    private void validateRewardType(RewardType rewardType) {
        if (rewardType == null) {
            throw new IllegalArgumentException("Reward type cannot be null");
        }
    }

    private void validateCartItems(List<OrderItemRequestDTO> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart items cannot be null or empty");
        }
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