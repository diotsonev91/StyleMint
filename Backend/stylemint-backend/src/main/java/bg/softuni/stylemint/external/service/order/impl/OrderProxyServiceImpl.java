package bg.softuni.stylemint.external.service.order.impl;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.external.dto.OrderPreviewResponse;
import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.external.service.order.OrderPriceService;
import bg.softuni.stylemint.external.service.order.OrderProxyService;
import bg.softuni.stylemint.product.audio.service.DigitalLicenseService;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProxyServiceImpl implements OrderProxyService {

    private final OrderServiceFacade orderServiceFacade;
    private final OrderPriceService orderPriceService;
    private final DigitalLicenseService sampleLicenseService;

    // ====================================================
    // CREATE ORDER
    // ====================================================
    @Override
    public CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request, UUID userId) {

        // 1) Calculate & set prices
        orderPriceService.calculateAndSetPrices(userId, request.getItems());

        // 2) Create order in microservice
        CreateOrderResponseDTO response = orderServiceFacade.createOrder(request);

        // 3) Consume one-time discount
        orderPriceService.consumeOneTimeDiscount(userId);

        return response;
    }

    // ====================================================
    // PREVIEW ORDER
    // ====================================================
    @Override
    public OrderPreviewResponse previewOrder(CreateOrderRequestDTO request, UUID userId) {

        double total = orderPriceService.previewOrderTotal(userId, request.getItems());

        return OrderPreviewResponse.builder()
                .totalAmount(total)
                .itemCount(request.getItems().size())
                .build();
    }

    // ====================================================
    // GET ORDER
    // ====================================================
    @Override
    public OrderDTO getOrder(UUID orderId, UUID userId) {

        OrderDTO order = orderServiceFacade.getOrder(orderId);

        if (!order.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("You cannot access this order.");
        }

        return order;
    }

    // ====================================================
    // ORDER STATUS
    // ====================================================
    @Override
    public OrderStatusDTO getOrderStatus(UUID orderId) {
        return orderServiceFacade.getOrderStatus(orderId);
    }

    // ====================================================
    // ORDER ITEMS
    // ====================================================
    @Override
    public List<OrderItemDTO> getOrderItems(UUID orderId, UUID userId) {

        OrderDTO order = orderServiceFacade.getOrder(orderId);

        if (!order.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("You cannot view items of this order.");
        }

        return orderServiceFacade.getOrderItems(orderId);
    }

    // ====================================================
    // USER SUMMARY
    // ====================================================
    @Override
    public UserOrderSummaryDTO getUserOrderSummary(UUID requestedUserId, UUID authUserId) {

        if (!requestedUserId.equals(authUserId)) {
            throw new ForbiddenOperationException("You cannot access another user's order summary.");
        }

        return orderServiceFacade.getUserOrderSummary(requestedUserId);
    }

    // ====================================================
    // ADMIN MANUAL DIGITAL UNLOCK
    // ====================================================
    @Override
    public void adminMarkDigitalUnlocked(UUID orderId, UUID itemId) {

        // 1) Load order & items
        OrderDTO order = orderServiceFacade.getOrder(orderId);

        OrderItemDTO item = orderServiceFacade.getOrderItems(orderId).stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Order item not found."));

        // 2) Issue license if digital
        if (item.getProductType() == ProductType.SAMPLE ||
                item.getProductType() == ProductType.PACK) {

            sampleLicenseService.createLicenseForPaidItem(order.getUserId(), item);
        }

        // 3) Mark item as unlocked in order microservice
        orderServiceFacade.markDigitalUnlocked(orderId, itemId);

        log.info("ADMIN unlocked digital item {} for order {}", itemId, orderId);
    }

    // ====================================================
    // PAYMENT SUCCESS (STRIPE CALLBACK)
    // ====================================================
    @Override
    public void processPaymentSuccess(OrderPaidRequest dto) {

        OrderDTO order = orderServiceFacade.getOrder(dto.orderId());
        List<OrderItemDTO> items = orderServiceFacade.getOrderItems(dto.orderId());

        for (OrderItemDTO item : items) {
            if (item.getProductType() == ProductType.SAMPLE ||
                    item.getProductType() == ProductType.PACK) {

                // Create license in main backend
                sampleLicenseService.createLicenseForPaidItem(order.getUserId(), item);

                // Mark item as unlocked in order microservice
                orderServiceFacade.markDigitalUnlocked(order.getOrderId(), item.getItemId());
            }
        }

        log.info("Payment success processed for order {}", dto.orderId());
    }

    // ====================================================
    // PRICE FOR SINGLE ITEM
    // ====================================================
    @Override
    public double calculateItemPrice(UUID userId, OrderItemRequestDTO item) {
        return orderPriceService.calculateItemPricePublic(userId, item);
    }
}
