package bg.softuni.stylemint.external.service.order;

import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.external.dto.OrderPreviewResponse;

import java.util.List;
import java.util.UUID;

public interface OrderProxyService {

    CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request, UUID userId);

    OrderPreviewResponse previewOrder(CreateOrderRequestDTO request, UUID userId);

    OrderDTO getOrder(UUID orderId, UUID userId);

    OrderStatusDTO getOrderStatus(UUID orderId);

    List<OrderItemDTO> getOrderItems(UUID orderId, UUID userId);

    UserOrderSummaryDTO getUserOrderSummary(UUID requestedUserId, UUID authUserId);

    void adminMarkDigitalUnlocked(UUID orderId, UUID itemId);

    void processPaymentSuccess(OrderPaidRequest dto);

    double calculateItemPrice(UUID userId, OrderItemRequestDTO item);
}
