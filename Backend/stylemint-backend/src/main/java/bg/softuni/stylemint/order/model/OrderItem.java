package bg.softuni.stylemint.order.model;

import bg.softuni.stylemint.product.fashion.model.FashionProduct;
import bg.softuni.stylemint.product.tech.model.TechProduct;
import bg.softuni.stylemint.customization.model.Customization;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"order", "fashionProduct", "techProduct"})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Either a fashion or tech product (only one non-null per row)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fashion_product_id")
    private FashionProduct fashionProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_product_id")
    private TechProduct techProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customization_id")
    private Customization customization; // optional link for customized shirts

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal price;
}
