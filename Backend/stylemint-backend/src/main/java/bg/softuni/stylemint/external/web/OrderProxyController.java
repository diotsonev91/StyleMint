// File: OrderProxyController.java (FINAL with Price Calculation)
package bg.softuni.stylemint.external.web;

import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.external.service.order.OrderPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

/**
 * Proxy Controller for Order Microservice with Price Calculation
 *
 * Key Responsibilities:
 * 1. Security & Authorization
 * 2. Price Calculation (via OrderPriceService) ✅ NEW
 * 3. Discount Management ✅ NEW
 * 4. Communication with Order Microservice (via OrderServiceFacade)
 *
 * Order Creation Flow:
 * 1. Frontend sends request WITHOUT prices (only productId, quantity, type)
 * 2. OrderProxyController calculates prices using OrderPriceService ✅
 * 3. OrderPriceService fetches products from DB and applies discounts ✅
 * 4. Prices are SET in OrderItemRequestDTO ✅
 * 5. Request forwarded to Order Microservice with CALCULATED prices
 * 6. After successful order, one-time discount is consumed ✅
 *
 * Architecture:
 * Frontend → OrderProxyController → OrderPriceService → PriceCalculatorService
 *                                  ↓
 *                          OrderServiceFacade → Order Microservice
 */
@Slf4j
@RestController
@RequestMapping(BASE + "/orders")
@RequiredArgsConstructor
public class OrderProxyController {

    private final OrderServiceFacade orderServiceFacade;
    private final OrderPriceService orderPriceService; // ✅ NEW

    // ========================================
    // ORDER CREATION WITH PRICE CALCULATION
    // ========================================

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CreateOrderResponseDTO> createOrder(
            @RequestBody CreateOrderRequestDTO request) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        // Security: Ensure userId in request matches authenticated user
        if (!request.getUserId().equals(authenticatedUserId)) {
            log.warn("User {} attempted to create order for different user {}",
                    authenticatedUserId, request.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("User {} creating order with {} items",
                authenticatedUserId,
                request.getItems().size());

        try {
            // ✅ STEP 1: Calculate and SET prices in order items
            // This fetches products from DB and applies discounts (NFT + one-time)
            orderPriceService.calculateAndSetPrices(authenticatedUserId, request.getItems());

            // Calculate total for logging (prices are now set)
            double totalAmount = orderPriceService.calculateTotalAmount(request.getItems());

            log.debug("Calculated order total: €{} for user {}", totalAmount, authenticatedUserId);

            // ✅ STEP 2: Forward to Order Microservice with CALCULATED prices
            CreateOrderResponseDTO response = orderServiceFacade.createOrder(request);

            log.info("✅ Order {} created successfully, total: €{}, paymentUrl: {}",
                    response.getOrderId(),
                    response.getTotalAmount(),
                    response.getPaymentUrl() != null ? "Stripe" : "Cash");

            // ✅ STEP 3: Consume one-time discount AFTER successful order
            orderPriceService.consumeOneTimeDiscount(authenticatedUserId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Failed to create order for user {}: {}", authenticatedUserId, e.getMessage(), e);
            throw e; // Will be handled by global exception handler
        }
    }

    // ========================================
    // ORDER PREVIEW (before actual creation)
    // ========================================

    @PostMapping("/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderPreviewResponse> previewOrder(
            @RequestBody CreateOrderRequestDTO request) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        // Security check
        if (!request.getUserId().equals(authenticatedUserId)) {
            log.warn("User {} attempted to preview order for different user {}",
                    authenticatedUserId, request.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.debug("User {} previewing order with {} items",
                authenticatedUserId, request.getItems().size());

        try {
            // Calculate total with discounts (NO consumption)
            double totalAmount = orderPriceService.previewOrderTotal(
                    authenticatedUserId,
                    request.getItems()
            );

            OrderPreviewResponse preview = OrderPreviewResponse.builder()
                    .totalAmount(totalAmount)
                    .itemCount(request.getItems().size())
                    .build();

            log.debug("Order preview for user {}: €{}", authenticatedUserId, totalAmount);

            return ResponseEntity.ok(preview);

        } catch (Exception e) {
            log.error("Failed to preview order for user {}: {}",
                    authenticatedUserId, e.getMessage(), e);
            throw e;
        }
    }

    // ========================================
    // ORDER RETRIEVAL
    // ========================================

    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable UUID orderId) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        log.debug("User {} requesting order {}", authenticatedUserId, orderId);

        OrderDTO order = orderServiceFacade.getOrder(orderId);

        // Security: Check if user is the owner of the order
        if (!order.getUserId().equals(authenticatedUserId)) {
            log.warn("User {} attempted to access order {} belonging to user {}",
                    authenticatedUserId, orderId, order.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.debug("Returning order {} to user {}", orderId, authenticatedUserId);

        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderStatusDTO> getOrderStatus(@PathVariable UUID orderId) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        log.debug("User {} requesting status for order {}", authenticatedUserId, orderId);

        OrderStatusDTO status = orderServiceFacade.getOrderStatus(orderId);

        return ResponseEntity.ok(status);
    }

    @GetMapping("/{orderId}/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable UUID orderId) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        log.debug("User {} requesting items for order {}", authenticatedUserId, orderId);

        // First get the order to verify ownership
        OrderDTO order = orderServiceFacade.getOrder(orderId);

        // Security check
        if (!order.getUserId().equals(authenticatedUserId)) {
            log.warn("User {} attempted to access items for order {} belonging to user {}",
                    authenticatedUserId, orderId, order.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<OrderItemDTO> items = orderServiceFacade.getOrderItems(orderId);

        log.debug("Returning {} items for order {} to user {}",
                items.size(), orderId, authenticatedUserId);

        return ResponseEntity.ok(items);
    }

    // ========================================
    // USER STATISTICS
    // ========================================

    @GetMapping("/user/{userId}/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserOrderSummaryDTO> getUserOrderSummary(@PathVariable UUID userId) {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        // Security: User can only view their own summary
        // ADMIN can view anyone's summary
        if (!userId.equals(authenticatedUserId) && !SecurityUtil.isAdmin()) {
            log.warn("User {} attempted to access summary for user {}",
                    authenticatedUserId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.debug("User {} requesting order summary for user {}", authenticatedUserId, userId);

        UserOrderSummaryDTO summary = orderServiceFacade.getUserOrderSummary(userId);

        log.debug("Returning order summary to user {}: {} total orders, {} recent",
                authenticatedUserId,
                summary.getTotalOrders(),
                summary.getRecentOrders().size());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/my-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserOrderSummaryDTO> getMyOrderSummary() {

        UUID authenticatedUserId = SecurityUtil.getCurrentUserId();

        log.debug("User {} requesting own order summary", authenticatedUserId);

        UserOrderSummaryDTO summary = orderServiceFacade.getUserOrderSummary(authenticatedUserId);

        return ResponseEntity.ok(summary);
    }

    // ========================================
    // INTERNAL/SYSTEM ENDPOINTS
    // ========================================

    @PostMapping("/{orderId}/items/{itemId}/digital-unlocked")
    @PreAuthorize("hasRole('SYSTEM') or hasRole('ADMIN')")
    public ResponseEntity<Void> markDigitalUnlocked(
            @PathVariable UUID orderId,
            @PathVariable UUID itemId) {

        log.info("System marking item {} as digital unlocked for order {}", itemId, orderId);

        orderServiceFacade.markDigitalUnlocked(orderId, itemId);

        log.info("Successfully marked item {} as digital unlocked", itemId);

        return ResponseEntity.ok().build();
    }

    // ========================================
    // WEBHOOK ENDPOINT (from Order Microservice)
    // ========================================

    /**
     * Endpoint for payment notifications from Order Microservice
     *
     * Flow:
     * 1. Stripe webhook → Order Microservice (StripeWebhookService)
     * 2. Order Microservice marks order as PAID
     * 3. Order Microservice calls this endpoint (MainApiClient)
     * 4. This endpoint processes digital items (licenses, NFTs)
     *
     * Called by: Order Microservice (MainApiClient.notifyOrderPaid())
     *
     * IMPORTANT: This is NOT a direct Stripe webhook!
     * Stripe webhooks are handled by Order Microservice.
     */
    @PostMapping("/payment-success")
    public ResponseEntity<Void> handlePaymentSuccess(
            @RequestBody OrderPaidRequest request) {

        log.info("📩 Received payment success notification from Order microservice for order: {}",
                request.orderId());

        try {
            // Get order details to process digital items
            OrderDTO order = orderServiceFacade.getOrder(request.orderId());
            List<OrderItemDTO> items = orderServiceFacade.getOrderItems(request.orderId());

            log.info("Processing {} items for paid order {}", items.size(), request.orderId());

            // Process digital items (SAMPLE, PACK)
            // This creates licenses and potentially mints NFTs
            for (OrderItemDTO item : items) {
                if (isDigitalProduct(item.getProductType())) {
                    processDigitalItem(order, item);
                }
            }

            log.info("✅ Successfully processed payment notification for order {}", request.orderId());

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("❌ Failed to process payment notification for order {}: {}",
                    request.orderId(), e.getMessage(), e);
            // Return 200 anyway to prevent Order microservice from retrying
            // Log error for manual investigation
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Check if product type is digital (needs license creation)
     */
    private boolean isDigitalProduct(bg.softuni.dtos.enums.payment.ProductType productType) {
        return productType == bg.softuni.dtos.enums.payment.ProductType.SAMPLE ||
                productType == bg.softuni.dtos.enums.payment.ProductType.PACK;
    }

    /**
     * Process digital item after payment
     * - Create license for SAMPLE or PACK
     * - Mark item as DIGITAL_UNLOCKED in Order microservice
     * - Potentially mint NFT rewards
     */
    private void processDigitalItem(OrderDTO order, OrderItemDTO item) {
        try {
            log.debug("Processing digital item: {} for order {}", item.getItemId(), order.getOrderId());

            // TODO: Create license via SampleLicenseService
            // sampleLicenseService.createLicense(order.getUserId(), item.getProductId(), ...);

            // Mark item as unlocked in Order microservice
            orderServiceFacade.markDigitalUnlocked(order.getOrderId(), item.getItemId());

            log.info("✅ Digital item {} unlocked for order {}", item.getItemId(), order.getOrderId());

        } catch (Exception e) {
            log.error("❌ Failed to process digital item {}: {}", item.getItemId(), e.getMessage(), e);
            throw e;
        }
    }

    // ========================================
    // HEALTH CHECK
    // ========================================

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Order Proxy with Price Calculation is healthy");
    }

    // ========================================
    // INNER DTO FOR PREVIEW RESPONSE
    // ========================================

    /**
     * Response DTO for order preview
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class OrderPreviewResponse {
        private Double totalAmount;
        private Integer itemCount;
    }
}