package bg.softuni.stylemint.orderservice.order.controller;


import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // CREATE ORDER
    @PostMapping("/create")
    public CreateOrderResponseDTO createOrder(@RequestBody CreateOrderRequestDTO request) {
        return orderService.createOrder(request);
    }

    // ORDER STATUS
    @GetMapping("/{orderId}/status")
    public OrderStatusDTO getOrderStatus(@PathVariable UUID orderId) {
        return orderService.getOrderStatus(orderId);
    }

    // GET FULL ORDER DETAILS
    @GetMapping("/{orderId}")
    public OrderDTO getOrder(@PathVariable UUID orderId) {
        return orderService.getOrder(orderId);
    }

    // GET ALL ITEMS FOR ORDER
    @GetMapping("/{orderId}/items")
    public List<OrderItemDTO> getOrderItems(@PathVariable UUID orderId) {
        return orderService.getOrderItems(orderId);
    }

    // USER ORDER SUMMARY
    @GetMapping("/user/{userId}/summary")
    public UserOrderSummaryDTO getUserSummary(@PathVariable UUID userId) {
        return orderService.getUserOrderSummary(userId);
    }


    // ITEM LEVEL UPDATES (used by orchestrator stylemint backend)
    @PostMapping("/{orderId}/items/{itemId}/digital-unlocked")
    public void digitalUnlocked(@PathVariable UUID orderId, @PathVariable UUID itemId) {
        orderService.markOrderItemDigitalUnlocked(orderId, itemId);
    }

}
