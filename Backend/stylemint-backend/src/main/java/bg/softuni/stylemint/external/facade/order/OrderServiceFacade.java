// File: OrderServiceFacade.java (COMPLETE VERSION)
package bg.softuni.stylemint.external.facade.order;

import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.external.client.order.OrderServiceClient;
import bg.softuni.stylemint.external.exceptions.order.OrderServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Facade за Order Microservice
 * Обгръща OrderServiceClient и добавя:
 * - Logging
 * - Error handling
 * - Exception translation
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderServiceFacade {

    private final OrderServiceClient orderServiceClient;

    // ========================================
    // ORDER CREATION
    // ========================================

    /**
     * Създаване на нова поръчка
     * @param request Заявка за създаване на поръчка
     * @return Response с orderId и детайли
     * @throws OrderServiceException при грешка в комуникацията
     */
    public CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        log.debug("Creating order for user: {} with {} items",
                request.getUserId(), request.getItems().size());

        try {
            CreateOrderResponseDTO response = orderServiceClient.createOrder(request);
            log.info("Successfully created order: {} for user: {} with {} items, total: {}€",
                    response.getOrderId(),
                    request.getUserId(),
                    response.getTotalItems(),
                    response.getTotalAmount());
            return response;
        } catch (Exception e) {
            log.error("Failed to create order for user: {}, items: {}, error: {}",
                    request.getUserId(), request.getItems().size(), e.getMessage());
            throw new OrderServiceException("Failed to create order", e);
        }
    }

    // ========================================
    // ORDER RETRIEVAL
    // ========================================

    /**
     * Получаване на пълни детайли за поръчка
     * @param orderId ID на поръчката
     * @return Пълна информация за поръчката
     * @throws OrderServiceException при грешка или липсваща поръчка
     */
    public OrderDTO getOrder(UUID orderId) {
        log.debug("Retrieving full order details for order: {}", orderId);

        try {
            OrderDTO order = orderServiceClient.getOrder(orderId);
            log.debug("Retrieved order: {} with {} items, status: {}, total: {}€",
                    orderId,
                    order.getItems().size(),
                    order.getStatus(),
                    order.getTotalAmount());
            return order;
        } catch (Exception e) {
            log.error("Failed to retrieve order: {}, error: {}", orderId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve order", e);
        }
    }

    /**
     * Получаване само на статуса на поръчка
     * @param orderId ID на поръчката
     * @return Статус на поръчката
     * @throws OrderServiceException при грешка
     */
    public OrderStatusDTO getOrderStatus(UUID orderId) {
        log.debug("Retrieving order status for order: {}", orderId);

        try {
            OrderStatusDTO status = orderServiceClient.getOrderStatus(orderId);
            log.debug("Order {} status: {}", orderId, status.getStatus());
            return status;
        } catch (Exception e) {
            log.error("Failed to retrieve order status for order: {}, error: {}",
                    orderId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve order status", e);
        }
    }

    /**
     * Получаване на всички items за поръчка
     * @param orderId ID на поръчката
     * @return Списък с order items
     * @throws OrderServiceException при грешка
     */
    public List<OrderItemDTO> getOrderItems(UUID orderId) {
        log.debug("Retrieving order items for order: {}", orderId);

        try {
            List<OrderItemDTO> items = orderServiceClient.getOrderItems(orderId);
            log.debug("Retrieved {} items for order: {}", items.size(), orderId);
            return items;
        } catch (Exception e) {
            log.error("Failed to retrieve order items for order: {}, error: {}",
                    orderId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve order items", e);
        }
    }

    // ========================================
    // USER STATISTICS
    // ========================================

    /**
     * Брой поръчки на потребител
     * @param userId ID на потребителя
     * @return Брой поръчки
     * @throws OrderServiceException при грешка
     */
    public Long countOrdersByUser(UUID userId) {
        log.debug("Counting orders for user: {}", userId);

        try {
            Long count = orderServiceClient.countOrdersByUser(userId);
            log.debug("User {} has {} orders", userId, count);
            return count;
        } catch (Exception e) {
            log.error("Failed to count orders for user: {}, error: {}",
                    userId, e.getMessage());
            throw new OrderServiceException("Failed to count user orders", e);
        }
    }

    /**
     * Обобщена информация за поръчките на потребител
     * @param userId ID на потребителя
     * @return Summary с последни поръчки и статистика
     * @throws OrderServiceException при грешка
     */
    public UserOrderSummaryDTO getUserOrderSummary(UUID userId) {
        log.debug("Retrieving order summary for user: {}", userId);

        try {
            UserOrderSummaryDTO summary = orderServiceClient.getUserOrderSummary(userId);
            log.debug("Retrieved order summary for user: {}, total orders: {}, recent orders: {}",
                    userId,
                    summary.getTotalOrders(),
                    summary.getRecentOrders().size());
            return summary;
        } catch (Exception e) {
            log.error("Failed to retrieve order summary for user: {}, error: {}",
                    userId, e.getMessage());
            throw new OrderServiceException("Failed to retrieve user order summary", e);
        }
    }

    // ========================================
    // ORDER ITEM UPDATES (Internal/System calls)
    // ========================================

    /**
     * Маркиране на digital item като unlocked
     * Използва се след успешно предоставяне на дигиталния продукт
     * @param orderId ID на поръчката
     * @param itemId ID на item-а
     * @throws OrderServiceException при грешка
     */
    public void markDigitalUnlocked(UUID orderId, UUID itemId) {
        log.debug("Marking item {} as digital unlocked for order: {}", itemId, orderId);

        try {
            orderServiceClient.markDigitalUnlocked(orderId, itemId);
            log.info("Successfully marked item {} as digital unlocked for order {}",
                    itemId, orderId);
        } catch (Exception e) {
            log.error("Failed to mark item {} as digital unlocked for order {}: {}",
                    itemId, orderId, e.getMessage());
            throw new OrderServiceException("Failed to mark item as digital unlocked", e);
        }
    }
}