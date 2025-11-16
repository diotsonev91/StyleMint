package bg.softuni.stylemint.orderservice.kafka;


import bg.softuni.events.delivery.StartDeliveryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes events to Delivery Service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String START_DELIVERY_TOPIC = "delivery.start";

    /**
     * Publishes event to start delivery process.
     * Delivery Service will pick this up and register with courier.
     */
    public void publishStartDelivery(StartDeliveryEvent event) {
        log.info("📤 Publishing StartDeliveryEvent for order {}", event.getOrderId());
        kafkaTemplate.send(START_DELIVERY_TOPIC, event.getOrderId().toString(), event);
    }
}