package bg.softuni.stylemint.external.service.order.impl;

import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.external.exceptions.order.UnsupportedProductTypeException;
import bg.softuni.stylemint.external.service.order.OrderPriceService;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.common.service.impl.BasePriceCalculatorService;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service implementation for calculating order prices
 *
 * Flow:
 * 1. Fetch products from stylemint-backend database
 * 2. Calculate prices using PriceCalculatorService (with discounts)
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

    // Price calculators with discount logic
    @Qualifier("fashionPriceCalculatorService")
    private final PriceCalculatorService<ClothDesign> fashionPriceCalculator;

    @Qualifier("audioSamplePriceCalculatorService")
    private final PriceCalculatorService<AudioSample> audioSamplePriceCalculator;

    @Qualifier("samplePackPriceCalculatorService")
    private final PriceCalculatorService<SamplePack> samplePackPriceCalculator;

    @Override
    @Transactional
    public void calculateAndSetPrices(UUID userId, List<OrderItemRequestDTO> items) {
        log.debug("Calculating prices for {} items for user {}", items.size(), userId);

        for (OrderItemRequestDTO item : items) {
            double calculatedPrice = calculateItemPrice(userId, item);

            // ✅ SET PRICE in DTO
            item.setPricePerUnit(calculatedPrice);

            log.debug("Set price for {} {}: €{}",
                    item.getProductType(),
                    item.getProductId(),
                    calculatedPrice);
        }

        log.info("✅ Calculated and set prices for {} items", items.size());
    }

    @Override
    public double calculateTotalAmount(List<OrderItemRequestDTO> items) {
        return items.stream()
                .mapToDouble(item -> item.getPricePerUnit() * item.getQuantity())
                .sum();
    }

    @Override
    @Transactional
    public void consumeOneTimeDiscount(UUID userId) {
        log.debug("Consuming one-time discount for user {}", userId);

        // Use fashion calculator to consume discount (all calculators share same logic)
        if (fashionPriceCalculator instanceof BasePriceCalculatorService) {
            BasePriceCalculatorService<?> baseCalculator =
                    (BasePriceCalculatorService<?>) fashionPriceCalculator;

            var usedDiscount = baseCalculator.consumeOneTimeDiscount(userId);

            if (usedDiscount != null) {
                log.info("✅ Consumed {} discount for user {}", usedDiscount, userId);
            } else {
                log.debug("No one-time discount to consume for user {}", userId);
            }
        }
    }

    @Override
    public double previewOrderTotal(UUID userId, List<OrderItemRequestDTO> items) {
        log.debug("Previewing order total for user {} with {} items", userId, items.size());

        double total = 0.0;

        for (OrderItemRequestDTO item : items) {
            double itemPrice = calculateItemPrice(userId, item);
            total += itemPrice * item.getQuantity();
        }

        log.debug("Preview total for user {}: €{}", userId, total);

        return total;
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Calculate price for single item based on product type
     *
     * @param userId User ID (for discount calculation)
     * @param item Order item
     * @return Calculated price with discounts applied
     */
    private double calculateItemPrice(UUID userId, OrderItemRequestDTO item) {
        return switch (item.getProductType()) {
            case CLOTHES -> calculateClothesPrice(item.getProductId());
            case SAMPLE -> calculateSamplePrice(item.getProductId());
            case PACK -> calculatePackPrice(item.getProductId());
            default -> throw new UnsupportedProductTypeException(
                    item.getProductType(),
                    item.getProductId()
            );
        };
    }


    /**
     * Calculate clothes price (fashion items)
     * - Fetch ClothDesign from database
     * - Use FashionPriceCalculatorService
     */
    private double calculateClothesPrice(UUID productId) {
        ClothDesign design = clothDesignRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Cloth design not found: " + productId
                ));

        double price = fashionPriceCalculator.calculatePrice(design);

        log.debug("Calculated clothes price for {}: €{}", productId, price);

        return price;
    }

    /**
     * Calculate audio sample price
     * - Fetch AudioSample from database
     * - Use AudioSamplePriceCalculatorService
     */
    private double calculateSamplePrice(UUID productId) {
        AudioSample sample = audioSampleRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Audio sample not found: " + productId
                ));

        double price = audioSamplePriceCalculator.calculatePrice(sample);

        log.debug("Calculated sample price for {}: €{}", productId, price);

        return price;
    }

    /**
     * Calculate sample pack price
     * - Fetch SamplePack from database
     * - Use SamplePackPriceCalculatorService
     */
    private double calculatePackPrice(UUID productId) {
        SamplePack pack = samplePackRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "Sample pack not found: " + productId
                ));

        double price = samplePackPriceCalculator.calculatePrice(pack);

        log.debug("Calculated pack price for {}: €{}", productId, price);

        return price;
    }
}