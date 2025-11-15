package bg.softuni.stylemint.orderservice.exception;

public class MissingDeliveryAddressException extends RuntimeException {
    public MissingDeliveryAddressException() {
        super("Delivery address is required for physical products (CLOTHES).");
    }
}

