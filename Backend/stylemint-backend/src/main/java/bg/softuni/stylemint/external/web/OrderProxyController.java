package bg.softuni.stylemint.external.web;

import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.external.dto.OrderPreviewResponse;
import bg.softuni.stylemint.external.service.order.OrderProxyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@Slf4j
@RestController
@RequestMapping(BASE + "/orders")
@RequiredArgsConstructor
public class OrderProxyController {

    private final OrderProxyService orderProxyService;

    // ====================================================
    // CREATE ORDER
    // ====================================================
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CreateOrderResponseDTO> createOrder(
            @RequestBody CreateOrderRequestDTO request) {

        UUID userId = SecurityUtil.getCurrentUserId();
        if (!request.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderProxyService.createOrder(request, userId));
    }

    // ====================================================
    // PREVIEW ORDER
    // ====================================================
    @PostMapping("/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderPreviewResponse> previewOrder(
            @RequestBody CreateOrderRequestDTO request) {

        UUID userId = SecurityUtil.getCurrentUserId();
        if (!request.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(orderProxyService.previewOrder(request, userId));
    }

    // ====================================================
    // GET ORDER
    // ====================================================
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable UUID orderId) {

        UUID userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(orderProxyService.getOrder(orderId, userId));
    }

    // ====================================================
    // GET ORDER STATUS
    // ====================================================
    @GetMapping("/{orderId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderStatusDTO> getOrderStatus(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderProxyService.getOrderStatus(orderId));
    }

    // ====================================================
    // GET ORDER ITEMS
    // ====================================================
    @GetMapping("/{orderId}/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable UUID orderId) {

        UUID userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(orderProxyService.getOrderItems(orderId, userId));
    }

    // ====================================================
    // USER SUMMARY
    // ====================================================
    @GetMapping("/user/{userId}/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserOrderSummaryDTO> getUserOrderSummary(@PathVariable UUID userIdPath) {

        UUID userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(orderProxyService.getUserOrderSummary(userIdPath, userId));
    }

    @GetMapping("/my-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserOrderSummaryDTO> getMyOrderSummary() {

        UUID userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(orderProxyService.getUserOrderSummary(userId, userId));
    }

    // ====================================================
    // ADMIN / SYSTEM: MARK DIGITAL UNLOCKED
    // ====================================================
    @PostMapping("/{orderId}/items/{itemId}/digital-unlocked")
    @PreAuthorize("hasRole('SYSTEM') or hasRole('ADMIN')")
    public ResponseEntity<Void> markDigitalUnlocked(
            @PathVariable UUID orderId,
            @PathVariable UUID itemId) {

        orderProxyService.adminMarkDigitalUnlocked(orderId, itemId);
        return ResponseEntity.ok().build();
    }

    // ====================================================
    // PAYMENT SUCCESS
    // ====================================================
    @PostMapping("/payment-success")
    public ResponseEntity<Void> handlePaymentSuccess(
            @RequestBody OrderPaidRequest request) {

        orderProxyService.processPaymentSuccess(request);
        return ResponseEntity.ok().build();
    }

    // ====================================================
    // PRICE FOR SINGLE ITEM
    // ====================================================
    @PostMapping("/price-item")
    public ResponseEntity<Double> getItemPrice(@RequestBody OrderItemRequestDTO item) {

        UUID userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(orderProxyService.calculateItemPrice(userId, item));
    }

    // ====================================================
    // HEALTH
    // ====================================================
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Order Proxy is healthy");
    }
}
