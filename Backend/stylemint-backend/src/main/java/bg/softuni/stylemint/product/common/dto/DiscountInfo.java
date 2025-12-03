package bg.softuni.stylemint.product.common.dto;

@lombok.Builder
@lombok.Data
public class DiscountInfo {
    private double basePrice;
    private double productSpecificDiscount;
    private double nftDiscount;
    private double oneTimeDiscount;
    private double finalPrice;
    private double totalDiscountPercentage;
}
