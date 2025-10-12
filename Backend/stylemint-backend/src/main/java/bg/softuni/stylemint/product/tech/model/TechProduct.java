package bg.softuni.stylemint.product.tech.model;

import bg.softuni.stylemint.product.common.BaseProduct;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "tech_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class TechProduct extends BaseProduct {

    private String brand;
    @Column(name = "product_condition")
    private String condition;
    private Integer warrantyMonths;
}
