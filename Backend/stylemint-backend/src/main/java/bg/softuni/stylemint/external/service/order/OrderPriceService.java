package bg.softuni.stylemint.external.service.order;

import bg.softuni.dtos.order.OrderItemRequestDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service for calculating order prices BEFORE sending to Order microservice
 *
 * Responsibilities:
 * - Fetch products from database (ClothDesign, AudioSample, SamplePack)
 * - Calculate prices using appropriate PriceCalculatorService
 * - Apply discounts (NFT + one-time)
 * - Update OrderItemRequestDTO with calculated prices
 * - Consume one-time discount after order creation
 *
 * Architecture:
 * Frontend → OrderProxyController → OrderPriceService → PriceCalculatorServices
 *                                  ↓
 *                          OrderServiceFacade → Order Microservice
 */
public interface OrderPriceService {

    /**
     * Calculate and set prices for all order items
     *
     * This method:
     * 1. Fetches products from database
     * 2. Calculates prices with discounts
     * 3. Updates pricePerUnit in each OrderItemRequestDTO
     *
     * @param userId User ID (for discount calculation)
     * @param items List of order items (prices will be SET in these DTOs)
     * @throws ProductNotFoundException if any product not found
     */
    void calculateAndSetPrices(UUID userId, List<OrderItemRequestDTO> items);

    /**
     * Calculate total order amount
     *
     * @param items Order items with prices already set
     * @return Total amount
     */
    double calculateTotalAmount(List<OrderItemRequestDTO> items);

    /**
     * Consume one-time discount for user after successful order
     * Called AFTER order is created in Order microservice
     *
     * @param userId User ID
     */
    void consumeOneTimeDiscount(UUID userId);

    /**
     * Preview order total with discounts applied
     * Used for cart preview BEFORE actual order creation
     *
     * @param userId User ID
     * @param items Order items (without prices)
     * @return Preview total with discounts
     */
    double previewOrderTotal(UUID userId, List<OrderItemRequestDTO> items);

    double calculateItemPricePublic(UUID userId, OrderItemRequestDTO item);
}
