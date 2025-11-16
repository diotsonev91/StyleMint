package bg.softuni.deliveryservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID orderId;

    @ElementCollection
    @CollectionTable(name = "delivery_items", joinColumns = @JoinColumn(name = "delivery_id"))
    @Column(name = "item_id")
    private List<UUID> itemIds;

    @Column(nullable = false)
    private String deliveryAddress;

    private String customerName;
    private String customerPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    private String trackingNumber;
    private String courierName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime registeredAt;
    private LocalDateTime completedAt;
}
