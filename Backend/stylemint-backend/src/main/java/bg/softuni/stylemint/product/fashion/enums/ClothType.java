package bg.softuni.stylemint.product.fashion.enums;

import lombok.Getter;

@Getter
public enum ClothType {
    HOODIE(49.99),
    CAP(18.99),
    T_SHIRT_CLASSIC(22.99),
    T_SHIRT_SPORT(29.99),
    SHOE(89.99);

    private final double basePrice;

    ClothType(double basePrice) {
        this.basePrice = basePrice;
    }

}
