package bg.softuni.stylemint.orderservice.order.exceptions;


public class InvalidProductTypeException extends RuntimeException {
    public InvalidProductTypeException(String message) {
        super(message);
    }
}
