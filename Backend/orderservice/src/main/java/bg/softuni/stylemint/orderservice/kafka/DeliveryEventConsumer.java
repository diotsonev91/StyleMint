package bg.softuni.stylemint.orderservice.kafka;

import bg.softuni.events.delivery.DeliveryCompletedEvent;
import bg.softuni.events.delivery.DeliveryRegisteredEvent;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Listens to Kafka events from Delivery Service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventConsumer {

    private final OrderService orderService;

    /**
     * Handles delivery registration confirmation from Delivery Service
     */
    @KafkaListener(topics = "delivery.registered", groupId = "order-service-group")
    public void handleDeliveryRegistered(DeliveryRegisteredEvent event) {
        log.info("📥 Delivery registered for order {}, tracking: {}",
                event.getOrderId(), event.getTrackingNumber());

        // TODO: Update order with tracking number
        // orderService.updateOrderTracking(event.getOrderId(), event.getTrackingNumber());
    }

    /**
     * Handles delivery completion from Delivery Service.
     * This is the event that triggers marking items as DELIVERED.
     */
    @KafkaListener(topics = "delivery.completed", groupId = "order-service-group")
    public void handleDeliveryCompleted(DeliveryCompletedEvent event) {
        log.info("📥📦 Delivery completed for order {} with {} items",
                event.getOrderId(), event.getItemIds().size());

        try {
            // Mark items as delivered using the batch method
            orderService.markOrderItemsDelivered(event.getOrderId(), event.getItemIds());

            log.info("✅ Order {} updated after delivery completion", event.getOrderId());

        } catch (Exception e) {
            log.error("❌ Failed to process delivery completion for order {}",
                    event.getOrderId(), e);
            // TODO: Dead letter queue or retry logic
        }
    }
}