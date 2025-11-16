package bg.softuni.deliveryservice.kafka;

import bg.softuni.events.delivery.DeliveryCompletedEvent;
import bg.softuni.events.delivery.DeliveryRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String DELIVERY_REGISTERED_TOPIC = "delivery.registered";
    private static final String DELIVERY_COMPLETED_TOPIC = "delivery.completed";

    public void publishDeliveryRegistered(DeliveryRegisteredEvent event) {
        log.info("📤 Publishing DeliveryRegisteredEvent for order {}", event.getOrderId());
        kafkaTemplate.send(DELIVERY_REGISTERED_TOPIC, event.getOrderId().toString(), event);
    }

    public void publishDeliveryCompleted(DeliveryCompletedEvent event) {
        log.info("📤 Publishing DeliveryCompletedEvent for order {}", event.getOrderId());
        kafkaTemplate.send(DELIVERY_COMPLETED_TOPIC, event.getOrderId().toString(), event);
    }
}
