package bg.softuni.stylemint.external.service.order.impl;

import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.external.exceptions.order.UnsupportedProductTypeException;
import bg.softuni.stylemint.external.service.order.OrderPriceService;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.common.service.EnhancedDiscountService;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service implementation for calculating order prices
 *
 * Flow:
 * 1. Fetch products from stylemint-backend database
 * 2. Calculate prices using EnhancedDiscountService (with discounts)
 * 3. Set prices in OrderItemRequestDTO
 * 4. Send to Order microservice
 * 5. Consume one-time discount after successful order
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderPriceServiceImpl implements OrderPriceService {

    // Repositories for fetching products
    private final ClothDesignRepository clothDesignRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;

    // Universal discount service (handles ALL discount types)
    private final EnhancedDiscountService discountService;

    @Override
    @Transactional
    public void calculateAndSetPrices(UUID userId, List<OrderItemRequestDTO> items) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        if (items == null || items.isEmpty()) {
            log.debug("No items to calculate prices for");
            return;
        }

        log.debug("Calculating prices for {} items for user {}", items.size(), userId);

        for (OrderItemRequestDTO item : items) {
            double calculatedPrice = calculateItemPrice(userId, item);

            // ✅ SET PRICE in DTO
            item.setPricePerUnit(calculatedPrice);

            log.debug("Set price for {} {}: €{} (quantity: {})",
                    item.getProductType(),
                    item.getProductId(),
                    calculatedPrice,
                    item.getQuantity());
        }

        log.info("✅ Calculated and set prices for {} items", items.size());
    }

    @Override
    public double calculateTotalAmount(List<OrderItemRequestDTO> items) {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }

        return items.stream()
                .mapToDouble(item -> item.getPricePerUnit() * item.getQuantity())
                .sum();
    }

    @Override
    @Transactional
    public void consumeOneTimeDiscount(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        log.debug("Consuming one-time discount for user {}", userId);

        var usedDiscount = discountService.useBestDiscount(userId);

        if (usedDiscount != null) {
            log.info("✅ Consumed {} discount for user {}", usedDiscount, userId);
        } else {
            log.debug("No one-time discount to consume for user {}", userId);
        }
    }

    @Override
    public double previewOrderTotal(UUID userId, List<OrderItemRequestDTO> items) {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }

        log.debug("Previewing order total for user {} with {} items", userId, items.size());

        double total = 0.0;

        for (OrderItemRequestDTO item : items) {
            double itemPrice = calculateItemPrice(userId, item);
            total += itemPrice * item.getQuantity();
        }

        log.debug("Preview total for user {}: €{}", userId, total);

        return total;
    }

    /**
     * Public method for external use (e.g., OrderProxyController)
     */
    public double calculateItemPricePublic(UUID userId, OrderItemRequestDTO item) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (item == null) {
            throw new IllegalArgumentException("Order item cannot be null");
        }

        return calculateItemPrice(userId, item);
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Calculate price for single item based on product type
     * Uses EnhancedDiscountService to apply ALL discounts:
     * - Product-specific (fashion bonus points)
     * - NFT discounts (5% or 7%)
     * - One-time discounts (20% or 40%)
     *
     * @param userId User ID (for discount calculation)
     * @param item Order item
     * @return Calculated price with discounts applied
     */
    private double calculateItemPrice(UUID userId, OrderItemRequestDTO item) {
        BaseProduct product = fetchProduct(item);

        // ✅ Calculate with ALL discounts applied
        double finalPrice = discountService.calculateFinalPrice(product, userId);

        log.debug("Calculated price for {} {}: €{} (user: {})",
                item.getProductType(),
                item.getProductId(),
                finalPrice,
                userId);

        return finalPrice;
    }

    /**
     * Fetch product from database based on type
     */
    private BaseProduct fetchProduct(OrderItemRequestDTO item) {
        return switch (item.getProductType()) {
            case CLOTHES -> fetchClothDesign(item.getProductId());
            case SAMPLE -> fetchAudioSample(item.getProductId());
            case PACK -> fetchSamplePack(item.getProductId());
            default -> throw new UnsupportedProductTypeException(
                    item.getProductType(),
                    item.getProductId()
            );
        };
    }

    /**
     * Fetch ClothDesign from database
     */
    private ClothDesign fetchClothDesign(UUID productId) {
        return clothDesignRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Cloth design not found: " + productId
                ));
    }

    /**
     * Fetch AudioSample from database
     */
    private AudioSample fetchAudioSample(UUID productId) {
        return audioSampleRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Audio sample not found: " + productId
                ));
    }

    /**
     * Fetch SamplePack from database
     */
    private SamplePack fetchSamplePack(UUID productId) {
        return samplePackRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Sample pack not found: " + productId
                ));
    }
}