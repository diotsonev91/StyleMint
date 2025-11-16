package bg.softuni.stylemint.orderservice.order.exceptions;


public class MissingDeliveryAddressException extends RuntimeException {

    public MissingDeliveryAddressException() {
        super("Delivery address is required for orders containing physical products.");
    }

    public MissingDeliveryAddressException(String message) {
        super(message);
    }
}
