package bg.softuni.stylemint.external.exceptions.order;


import bg.softuni.dtos.enums.payment.ProductType;

import java.util.UUID;

/**
 * Exception thrown when an order contains a product type that is not supported
 * for price calculation or order processing
 */
public class UnsupportedProductTypeException extends RuntimeException {

    private final ProductType productType;
    private final UUID productId;

    public UnsupportedProductTypeException(ProductType productType, UUID productId) {
        super(String.format("Product type '%s' is not supported for order processing. Product ID: %s",
                productType, productId));
        this.productType = productType;
        this.productId = productId;
    }

    public UnsupportedProductTypeException(ProductType productType) {
        super(String.format("Product type '%s' is not supported for order processing", productType));
        this.productType = productType;
        this.productId = null;
    }

    public ProductType getProductType() {
        return productType;
    }

    public UUID getProductId() {
        return productId;
    }
}