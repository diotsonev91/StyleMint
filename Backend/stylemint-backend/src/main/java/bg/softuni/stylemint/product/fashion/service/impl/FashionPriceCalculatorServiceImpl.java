package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("fashionPriceCalculatorService")
public class FashionPriceCalculatorServiceImpl implements PriceCalculatorService<ClothDesign> {

    // Base prices by cloth type
    private static final Map<ClothType, Double> BASE_PRICES = Map.of(
            ClothType.T_SHIRT_SPORT, 29.99,
            ClothType.T_SHIRT_CLASSIC, 24.99,
            ClothType.HOODIE, 49.99,
            ClothType.CAP, 19.99,
            ClothType.SHOE, 89.99
    );

    private double calculateMultiplier(Integer bonusPoints) {
        if (bonusPoints == null) return 1.0;
        if (bonusPoints >= 100) return 1.3;
        if (bonusPoints >= 50) return 1.15;
        if (bonusPoints >= 20) return 1.0;
        return 0.95;
    }

    @Override
    public double calculatePrice(ClothDesign product) {
        // Use ClothType to determine base price
        double basePrice = BASE_PRICES.getOrDefault(product.getClothType(), 29.99);
        Integer bonusPoints = product.getBonusPoints();
        double multiplier = calculateMultiplier(bonusPoints);

        // Add premium for custom decals
        double customDecalPremium = (product.getCustomDecalPath() != null) ? 5.0 : 0.0;

        return (basePrice * multiplier) + customDecalPremium;
    }
}