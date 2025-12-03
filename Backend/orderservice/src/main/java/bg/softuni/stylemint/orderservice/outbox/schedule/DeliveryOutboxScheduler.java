package bg.softuni.stylemint.orderservice.outbox.schedule;

import bg.softuni.events.delivery.StartDeliveryEvent;
import bg.softuni.stylemint.orderservice.kafka.DeliveryEventProducer;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.repository.OrderItemRepository;
import bg.softuni.stylemint.orderservice.outbox.model.OutboxEvent;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional  // ⚠️ ДОБАВЕТЕ ТОВА!
public class DeliveryOutboxScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final DeliveryEventProducer deliveryEventProducer;
    private final OrderItemRepository orderItemRepository;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutbox() {
        List<OutboxEvent> events = outboxEventRepository.findByProcessedFalse();

        for (OutboxEvent e : events) {
            processSingleEvent(e);
        }
    }

    @Transactional
    public void processSingleEvent(OutboxEvent e) {
        try {
            StartDeliveryEvent event = new ObjectMapper().readValue(e.getPayloadJson(), StartDeliveryEvent.class);

            log.info("📤 Sending delivery event for order {}, containing {} items",
                    event.getOrderId(), event.getItemIds().size());


            List<UUID> orderItemIds = e.getOrderItemIds();

            if (orderItemIds != null && !orderItemIds.isEmpty()) {
                log.info("📦 Associated OrderItem IDs: {}", orderItemIds);

                List<OrderItem> items = orderItemRepository.findAllById(orderItemIds);
                if (items.size() != orderItemIds.size()) {
                    log.warn("⚠️ Some OrderItems were deleted. Found {}/{}",
                            items.size(), orderItemIds.size());
                }
            }

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
