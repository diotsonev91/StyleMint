package bg.softuni.stylemint.orderservice.outbox.model;

import bg.softuni.stylemint.orderservice.outbox.enums.OutboxEventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_outbox_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID orderId;

    @Column(columnDefinition = "TEXT")
    private String payloadJson;

    @Enumerated(EnumType.STRING)
    private OutboxEventType eventType; // e.g. START_DELIVERY

    private boolean processed;

    private OffsetDateTime createdAt;
    private OffsetDateTime processedAt;
}
