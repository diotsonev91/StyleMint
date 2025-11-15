package bg.softuni.stylemint.orderservice.exception;


public class InvalidProductTypeException extends RuntimeException {
    public InvalidProductTypeException(String message) {
        super(message);
    }
}
