// File: OrderServiceFacade.java (updated with DTOs)
package bg.softuni.stylemint.external.facade.order;

import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.dtos.order.UserOrderSummaryDTO;
import bg.softuni.stylemint.external.client.order.OrderServiceClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderServiceFacade {

    private final OrderServiceClient orderServiceClient;

    public List<OrderItemDTO> getOrderItems(UUID orderId) {
        log.debug("Retrieving order items for order: {}", orderId);

        try {
            List<OrderItemDTO> items = orderServiceClient.getOrderItems(orderId);
            log.debug("Retrieved {} items for order: {}", items.size(), orderId);
            return items;
        } catch (Exception e) {
            log.error("Failed to retrieve order items for order: {}, error: {}", orderId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve order items", e);
        }
    }

    public Long countOrdersByUser(UUID userId) {
        log.debug("Counting orders for user: {}", userId);

        try {
            Long count = orderServiceClient.countOrdersByUser(userId);
            log.debug("User {} has {} orders", userId, count);
            return count;
        } catch (Exception e) {
            log.error("Failed to count orders for user: {}, error: {}", userId, e.getMessage());
            throw new OrderServiceException("Failed to count user orders", e);
        }
    }

    public UserOrderSummaryDTO getUserOrderSummary(UUID userId) {
        log.debug("Retrieving order summary for user: {}", userId);

        try {
            UserOrderSummaryDTO summary = orderServiceClient.getUserOrderSummary(userId);
            log.debug("Retrieved order summary for user: {}", userId);
            return summary;
        } catch (Exception e) {
            log.error("Failed to retrieve order summary for user: {}, error: {}", userId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve user order summary", e);
        }
    }
}