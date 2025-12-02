package bg.softuni.stylemint.orderservice.integration;

import bg.softuni.events.delivery.StartDeliveryEvent;
import bg.softuni.stylemint.orderservice.kafka.DeliveryEventProducer;
import bg.softuni.stylemint.orderservice.outbox.enums.OutboxEventType;
import bg.softuni.stylemint.orderservice.outbox.model.OutboxEvent;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;
import bg.softuni.stylemint.orderservice.outbox.schedule.DeliveryOutboxScheduler;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ScheduledFuture;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;



@SpringBootTest(properties = "spring.profiles.active=test")
@Import(DeliveryOutboxSchedulerIntegrationTest.NoSchedulingConfig.class)
@AutoConfigureTestDatabase
class DeliveryOutboxSchedulerIntegrationTest {


    @TestConfiguration
    static class NoSchedulingConfig {
        @Bean
        public TaskScheduler taskScheduler() {
            return new TaskScheduler() {

                @Override
                public ScheduledFuture<?> schedule(Runnable task, Trigger trigger) {
                    return null;
                }

                @Override
                public ScheduledFuture<?> schedule(Runnable task, Instant startTime) {
                    return null;
                }

                @Override
                public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, Instant startTime, Duration period) {
                    return null;
                }

                @Override
                public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, Duration period) {
                    return null;
                }

                @Override
                public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, Instant startTime, Duration delay) {
                    return null;
                }

                @Override
                public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, Duration delay) {
                    return null;
                }
            };
        }
    }

    @Autowired
    private OutboxEventRepository outboxRepo;

    @Autowired
    private DeliveryOutboxScheduler scheduler;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private DeliveryEventProducer deliveryEventProducer;

    @Test
    void processOutbox_ShouldSendKafkaAndMarkProcessed() throws Exception {

        // ARRANGE
        UUID orderId = UUID.randomUUID();
        List<UUID> itemIds = List.of(UUID.randomUUID(), UUID.randomUUID());

        StartDeliveryEvent payload = new StartDeliveryEvent(
                orderId,
                itemIds,
                "Test Address",
                "John Doe",
                "+359888123456"
        );

        String json = mapper.writeValueAsString(payload);

        OutboxEvent event = OutboxEvent.builder()
                .orderId(orderId)
                .eventType(OutboxEventType.START_DELIVERY)
                .payloadJson(json)
                .processed(false)
                .createdAt(OffsetDateTime.now())
                .build();

        outboxRepo.save(event);

        // ACT — директно извикваме scheduler-а
        scheduler.processOutbox();

        // ASSERT 1: Producer е извикан
        verify(deliveryEventProducer, times(1)).publishStartDelivery(Mockito.any(StartDeliveryEvent.class));

        // ASSERT 2: Event-ът е маркиран processed=true
        OutboxEvent updated = outboxRepo.findById(event.getId()).orElseThrow();
        assertThat(updated.isProcessed()).isTrue();

        // ASSERT 3: processedAt е попълнено
        assertThat(updated.getProcessedAt()).isNotNull();

        // ASSERT 4: payload-ът не е пипан
        assertThat(updated.getPayloadJson()).isEqualTo(json);

        // ASSERT 5: Типът на event-а е същият
        assertThat(updated.getEventType()).isEqualTo(OutboxEventType.START_DELIVERY);
    }
}
