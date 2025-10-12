package bg.softuni.stylemint.customization.model;


import bg.softuni.stylemint.product.fashion.model.FashionProduct;
import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "product"})
public class Customization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private FashionProduct product;

    private String color;
    private String texture;
    private String logoUrl;
    private String previewImage;

    private LocalDateTime savedAt = LocalDateTime.now();
}
