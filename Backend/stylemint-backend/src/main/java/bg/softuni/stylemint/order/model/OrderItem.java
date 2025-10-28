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
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, columnDefinition = "BINARY(16)")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 16)
    private ProductType productType; // CLOTHES/SAMPLE/PACK

    @Column(name = "product_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID productId; // ClothDesign.id / AudioSample.id / SamplePack.id

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
