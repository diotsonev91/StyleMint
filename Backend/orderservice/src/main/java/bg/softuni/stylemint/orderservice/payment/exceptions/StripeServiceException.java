package bg.softuni.stylemint.orderservice.payment.exceptions;

/**
 * Custom exception for Stripe service related errors
 */
public class StripeServiceException extends RuntimeException {

    public StripeServiceException(String message) {
        super(message);
    }

    public StripeServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}