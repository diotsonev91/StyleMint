package bg.softuni.deliveryservice.kafka;

import bg.softuni.deliveryservice.service.DeliveryService;
import bg.softuni.events.delivery.StartDeliveryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventConsumer {

    private final DeliveryService deliveryService;

    @KafkaListener(topics = "delivery.start", groupId = "delivery-service-group")
    public void handleStartDelivery(StartDeliveryEvent event) {
        log.info("📥 Received StartDeliveryEvent for order {}", event.getOrderId());
        
        try {
            deliveryService.startDelivery(event);
        } catch (Exception e) {
            log.error("❌ Failed to process StartDeliveryEvent for order {}", event.getOrderId(), e);
            // TODO: Dead letter queue or retry logic
        }
    }
}
