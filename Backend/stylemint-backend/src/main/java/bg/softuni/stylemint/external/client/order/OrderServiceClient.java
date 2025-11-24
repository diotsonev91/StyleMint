// File: OrderServiceClient.java (COMPLETE VERSION)
package bg.softuni.stylemint.external.client.order;

import bg.softuni.dtos.order.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Feign Client за комуникация с Order Microservice
 * Съдържа всички налични endpoints от OrderController на микросервиза
 */
@FeignClient(name = "order-service", url = "${app.services.order.url}")
public interface OrderServiceClient {

    // ========================================
    // ORDER CREATION
    // ========================================

    /**
     * Създаване на нова поръчка
     * @param request Заявка за създаване на поръчка
     * @return Response с orderId, статус и детайли
     */
    @PostMapping("/api/orders/create")
    CreateOrderResponseDTO createOrder(@RequestBody CreateOrderRequestDTO request);

    // ========================================
    // ORDER RETRIEVAL
    // ========================================

    /**
     * Получаване на пълни детайли за поръчка
     * @param orderId ID на поръчката
     * @return Пълна информация за поръчката
     */
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrder(@PathVariable("orderId") UUID orderId);

    /**
     * Получаване само на статуса на поръчка
     * @param orderId ID на поръчката
     * @return Статус на поръчката
     */
    @GetMapping("/api/orders/{orderId}/status")
    OrderStatusDTO getOrderStatus(@PathVariable("orderId") UUID orderId);

    /**
     * Получаване на всички items за конкретна поръчка
     * @param orderId ID на поръчката
     * @return Списък с order items
     */
    @GetMapping("/api/orders/{orderId}/items")
    List<OrderItemDTO> getOrderItems(@PathVariable("orderId") UUID orderId);

    // ========================================
    // USER STATISTICS
    // ========================================

    /**
     * Брой поръчки на потребител
     * @param userId ID на потребителя
     * @return Брой поръчки
     */
    @GetMapping("/api/orders/user/{userId}/count")
    Long countOrdersByUser(@PathVariable("userId") UUID userId);

    /**
     * Обобщена информация за поръчките на потребител
     * @param userId ID на потребителя
     * @return Summary с последни поръчки и статистика
     */
    @GetMapping("/api/orders/user/{userId}/summary")
    UserOrderSummaryDTO getUserOrderSummary(@PathVariable("userId") UUID userId);

    // ========================================
    // ORDER ITEM UPDATES (Internal/System calls)
    // ========================================

    /**
     * Маркиране на digital item като unlocked
     * Използва се след успешно предоставяне на дигиталния продукт
     * @param orderId ID на поръчката
     * @param itemId ID на item-а
     */
    @PostMapping("/api/orders/{orderId}/items/{itemId}/digital-unlocked")
    void markDigitalUnlocked(
            @PathVariable("orderId") UUID orderId,
            @PathVariable("itemId") UUID itemId
    );
}