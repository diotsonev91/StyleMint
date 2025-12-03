package bg.softuni.stylemint.orderservice.kafka;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.OrderDTO;
import bg.softuni.events.delivery.DeliveryCompletedEvent;
import bg.softuni.events.delivery.DeliveryRegisteredEvent;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
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

        // 1) Update tracking number
        orderService.updateOrderTracking(event.getOrderId(), event.getTrackingNumber());

        // 2) Get order with items
        OrderDTO order = orderService.getOrder(event.getOrderId());

        // 3) Mark all clothing items as SHIPPED
        order.getItems().stream()
                .filter(i -> i.getProductType().equals(ProductType.CLOTHES))
                .forEach(item -> {
                    orderService.markOrderItemShipped(event.getOrderId(), item.getItemId());
                });

        log.info("🚚 All clothing items for order {} marked as SHIPPED", event.getOrderId());
    }


    /**
     * Handles delivery completion from Delivery Service.
     * This is the event that triggers marking items as DELIVERED.
     *
     * IMPORTANT: event.getItemIds() contains PRODUCT IDs, not OrderItem IDs!
     */
    @KafkaListener(topics = "delivery.completed", groupId = "order-service-group")
    public void handleDeliveryCompleted(DeliveryCompletedEvent event) {

        try {
            log.info("📥 Received DeliveryCompletedEvent for order {} with {} product IDs",
                    event.getOrderId(),
                    event.getItemIds() != null ? event.getItemIds().size() : "NULL");

            if (event.getItemIds() == null || event.getItemIds().isEmpty()) {
                log.error("❌ CRITICAL: DeliveryCompletedEvent has null/empty itemIds for order {}!",
                        event.getOrderId());
                return; // Don't process if no items
            }

            processDeliveryCompleted(event);  // retry-enabled
        } catch (Exception e) {
            log.error("❌ Delivery completion FAILED after retries for order {}",
                    event.getOrderId(), e);

            // OPTIONAL: dead-letter queue, outbox pattern, save error to db, etc.
            // deadLetterService.storeFailedDelivery(event);
        }
    }

    /**
     * Processes delivery completion with retry logic.
     *
     * @param event Contains orderId and productIds (NOT orderItem IDs!)
     */
    @Retryable(
            value = Exception.class,
            maxAttempts = 3,               // колко опита
            backoff = @Backoff(
                    delay = 2000,         // стартово изчакване 2s
                    multiplier = 2        // експоненциален растеж: 2s → 4s → 8s
            )
    )
    public void processDeliveryCompleted(DeliveryCompletedEvent event) {

        log.info("🔄 Processing delivery completion for order {} (retry-enabled)", event.getOrderId());
        log.info("📦 Product IDs to mark as DELIVERED: {}", event.getItemIds());

        // ✅ Pass productIds to service (NOT orderItem IDs!)
        orderService.markOrderItemsDelivered(event.getOrderId(), event.getItemIds());

        log.info("✅ Successfully processed delivery completion for order {}", event.getOrderId());
    }
}