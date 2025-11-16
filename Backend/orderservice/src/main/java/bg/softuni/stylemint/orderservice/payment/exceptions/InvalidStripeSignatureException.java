package bg.softuni.stylemint.orderservice.payment.exceptions;

import bg.softuni.stylemint.orderservice.webhook.exceptions.StripeWebhookException;

public class InvalidStripeSignatureException extends StripeWebhookException {
    public InvalidStripeSignatureException(String signature) {
        super("Invalid Stripe signature: " + signature);
    }

    public InvalidStripeSignatureException(String signature, Throwable cause) {
        super("Invalid Stripe signature: " + signature, cause);
    }
}
