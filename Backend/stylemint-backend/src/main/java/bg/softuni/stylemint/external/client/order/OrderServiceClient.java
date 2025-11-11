// File: OrderServiceClient.java (updated with DTOs)
package bg.softuni.stylemint.external.client.order;

import bg.softuni.stylemint.external.dto.order.OrderItemDTO;
import bg.softuni.stylemint.external.dto.order.UserOrderSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "order-service", url = "${app.services.order.url}")
public interface OrderServiceClient {

    @GetMapping("/api/orders/{orderId}/items")
    List<OrderItemDTO> getOrderItems(@PathVariable UUID orderId);

    @GetMapping("/api/orders/user/{userId}/count")
    Long countOrdersByUser(@PathVariable UUID userId);

    @GetMapping("/api/orders/user/{userId}/summary")
    UserOrderSummaryDTO getUserOrderSummary(@PathVariable UUID userId);
}