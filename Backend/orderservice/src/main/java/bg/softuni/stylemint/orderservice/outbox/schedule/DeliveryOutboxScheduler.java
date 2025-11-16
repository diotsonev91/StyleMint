package bg.softuni.stylemint.orderservice.outbox.schedule;

import bg.softuni.events.delivery.StartDeliveryEvent;
import bg.softuni.stylemint.orderservice.kafka.DeliveryEventProducer;
import bg.softuni.stylemint.orderservice.outbox.model.OutboxEvent;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryOutboxScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final DeliveryEventProducer deliveryEventProducer;

    @Scheduled(fixedDelay = 5000) // на 5 секунди
    public void processOutbox() {

        List<OutboxEvent> events = outboxEventRepository.findByProcessedFalse();

        for (OutboxEvent e : events) {
            try {
                // deserialize payload
                StartDeliveryEvent event =
                        new ObjectMapper().readValue(e.getPayloadJson(), StartDeliveryEvent.class);

                // send to Kafka
                deliveryEventProducer.publishStartDelivery(event);

                // mark as processed
                e.setProcessed(true);
                e.setProcessedAt(OffsetDateTime.now());
                outboxEventRepository.save(e);

            } catch (Exception ex) {
                log.error("❌ Failed to process outbox event {}", e.getId(), ex);
            }
        }
    }
}
