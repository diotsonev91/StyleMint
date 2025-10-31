package bg.softuni.stylemint.order.model;

import bg.softuni.stylemint.order.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 16)
    private ProductType productType; // CLOTHES/SAMPLE/PACK

    @Column(name = "product_id",nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_unit", nullable = false)
    private Double pricePerUnit; // freeze at time of purchase

    @Lob
    @Column(name = "customization_json", columnDefinition = "json")
    private String customizationJson; // only for CLOTHES, null otherwise

    @CreationTimestamp
    private OffsetDateTime createdAt;
}
