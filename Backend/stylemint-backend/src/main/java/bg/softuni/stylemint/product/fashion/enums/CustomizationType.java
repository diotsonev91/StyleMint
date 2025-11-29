package bg.softuni.stylemint.product.fashion.enums;

public enum CustomizationType {

    SIMPLE(20, 1.05),
    ADVANCED(40, 1.15);

    private final int bonusPoints;      // за награди на юзера
    private final double priceFactor;   // за цена

    CustomizationType(int bonusPoints, double priceFactor) {
        this.bonusPoints = bonusPoints;
        this.priceFactor = priceFactor;
    }

    public int getBonusPoints() {
        return bonusPoints;   // за натрупване на точки
    }

    public double getPriceFactor() {
        return priceFactor;   // за ценова сложност
    }
}
