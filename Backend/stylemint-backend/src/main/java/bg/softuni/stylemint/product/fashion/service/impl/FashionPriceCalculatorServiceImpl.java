package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.common.service.PriceCalculatorService;
import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import org.springframework.stereotype.Service;

@Service("fashionPriceCalculatorService")
public class FashionPriceCalculatorServiceImpl implements PriceCalculatorService<ClothDesign> {


    private double calculateMultiplier(Integer bonusPoints) {
        if (bonusPoints == null) return 1.0;
        if (bonusPoints >= 100) return 1.2;
        if (bonusPoints >= 50) return 1.1;
        if (bonusPoints >= 20) return 1.0;
        return 0.9;
    }

    @Override
    public double calculatePrice(ClothDesign product) {
        double basePrice = product.getPrice();
        Integer bonusPoints = product.getBonusPoints();
        double multiplier = calculateMultiplier(bonusPoints);
        return basePrice * multiplier;
    }
}
