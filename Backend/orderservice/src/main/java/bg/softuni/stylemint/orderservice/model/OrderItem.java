package bg.softuni.stylemint.orderservice.model;

import bg.softuni.stylemint.orderservice.enums.OrderItemStatus;
import bg.softuni.stylemint.orderservice.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", columnDefinition = "BINARY(16)", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 16)
    private ProductType productType;

    @Column(name = "product_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_unit", nullable = false)
    private Double pricePerUnit;

    @Column(name = "customization_json", columnDefinition = "JSON")
    private String customizationJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status", nullable = false, length = 32)
    private OrderItemStatus itemStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
