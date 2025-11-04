package bg.softuni.stylemint.product.common.service;

import bg.softuni.stylemint.product.common.model.BaseProduct;

public interface PriceCalculatorService<T extends BaseProduct> {
    double calculatePrice(T product);
}
