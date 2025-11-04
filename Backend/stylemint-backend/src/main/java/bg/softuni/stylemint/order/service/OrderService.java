package bg.softuni.stylemint.order.service;

import bg.softuni.stylemint.order.dto.UserOrderSummaryDTO;

import java.util.UUID;

public interface OrderService {
    long countOrdersByUser(UUID userId);

    UserOrderSummaryDTO getUserOrderSummary(UUID userId);
}
