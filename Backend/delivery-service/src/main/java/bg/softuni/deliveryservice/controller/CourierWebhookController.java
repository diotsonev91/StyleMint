package bg.softuni.deliveryservice.controller;

import bg.softuni.deliveryservice.external.dto.CourierWebhookRequest;
import bg.softuni.deliveryservice.service.DeliveryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Webhook endpoint for courier callbacks.
 * Courier API calls this when delivery status changes.
 */
@RestController
@RequestMapping("/api/webhooks/courier")
@RequiredArgsConstructor
@Slf4j
public class CourierWebhookController {

    private final DeliveryService deliveryService;

    /**
     * Webhook endpoint called by courier when delivery is completed.
     * 
     * Example: Speedy calls this webhook when package is delivered
     * POST /api/webhooks/courier/delivery-completed
     * {
     *   "trackingNumber": "SPEEDY-12345",
     *   "status": "DELIVERED",
     *   "deliveredAt": "2025-11-20T15:30:00Z"
     * }
     */
    @PostMapping("/delivery-completed")
    public ResponseEntity<?> handleDeliveryCompleted(@RequestBody CourierWebhookRequest request) {
        
        log.info("📥 Received courier webhook for tracking: {}", request.getTrackingNumber());
        log.info("Status: {}, Delivered at: {}", request.getStatus(), request.getDeliveredAt());

        try {
            if ("DELIVERED".equals(request.getStatus())) {
                deliveryService.handleDeliveryCompletion(request.getTrackingNumber());
                return ResponseEntity.ok().build();
            } else {
                log.warn("⚠️ Received non-delivery status: {}", request.getStatus());
                return ResponseEntity.ok().build(); // Still acknowledge receipt
            }
        } catch (Exception e) {
            log.error("❌ Failed to process webhook", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Webhook for delivery status updates (in transit, etc.)
     */
    @PostMapping("/status-update")
    public ResponseEntity<?> handleStatusUpdate(@RequestBody CourierWebhookRequest request) {
        log.info("📥 Delivery status update: {} -> {}", 
                 request.getTrackingNumber(), request.getStatus());
        
        // TODO: Update delivery status in database
        // deliveryService.updateDeliveryStatus(request.getTrackingNumber(), request.getStatus());
        
        return ResponseEntity.ok().build();
    }
}

