package bg.softuni.stylemint.product.fashion.model;

import bg.softuni.stylemint.product.common.BaseProduct;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "fashion_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class FashionProduct extends BaseProduct {

    private String color;
    private String size;
    private String material;
    private String model3dUrl;
    private boolean customizable;
}