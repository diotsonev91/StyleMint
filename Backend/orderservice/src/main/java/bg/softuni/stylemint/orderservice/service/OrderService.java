package bg.softuni.stylemint.orderservice.service;

import bg.softuni.stylemint.orderservice.dto.UserOrderSummaryDTO;
import bg.softuni.stylemint.orderservice.model.OrderItem;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    long countOrdersByUser(UUID userId);

    UserOrderSummaryDTO getUserOrderSummary(UUID userId);

    List<OrderItem> findByOrderId(UUID orderId);

    List<OrderItem> findOrderItemsByOrderId(UUID id);
}
