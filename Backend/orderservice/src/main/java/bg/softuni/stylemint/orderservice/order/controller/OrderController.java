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

    // ORDER STATUS UPDATES (used by orchestrator / admin)
    @PostMapping("/{orderId}/mark-paid")
    public void markPaid(@PathVariable UUID orderId) {
        orderService.markOrderAsPaid(orderId);
    }

    @PostMapping("/{orderId}/mark-failed")
    public void markFailed(@PathVariable UUID orderId) {
        orderService.markOrderAsFailed(orderId);
    }

    @PostMapping("/{orderId}/mark-cancelled")
    public void markCancelled(@PathVariable UUID orderId) {
        orderService.markOrderAsCancelled(orderId);
    }

    @PostMapping("/{orderId}/mark-fulfilled")
    public void markFulfilled(@PathVariable UUID orderId) {
        orderService.markOrderAsFulfilled(orderId);
    }

    // ITEM LEVEL UPDATES (used by orchestrator)
    @PostMapping("/{orderId}/items/{itemId}/digital-unlocked")
    public void digitalUnlocked(@PathVariable UUID orderId, @PathVariable UUID itemId) {
        orderService.markOrderItemDigitalUnlocked(orderId, itemId);
    }

    @PostMapping("/{orderId}/items/{itemId}/shipped")
    public void markShipped(@PathVariable UUID orderId, @PathVariable UUID itemId) {
        orderService.markOrderItemShipped(orderId, itemId);
    }

    @PostMapping("/{orderId}/items/{itemId}/delivered")
    public void markDelivered(@PathVariable UUID orderId, @PathVariable UUID itemId) {
        orderService.markOrderItemDelivered(orderId, itemId);
    }

    @PostMapping("/{orderId}/items/{itemId}/cancel")
    public void cancelItem(@PathVariable UUID orderId, @PathVariable UUID itemId) {
        orderService.cancelOrderItem(orderId, itemId);
    }
}
