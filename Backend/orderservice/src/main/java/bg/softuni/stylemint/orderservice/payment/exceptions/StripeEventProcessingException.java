package bg.softuni.stylemint.orderservice.payment.exceptions;

import bg.softuni.stylemint.orderservice.webhook.exceptions.StripeWebhookException;

public class StripeEventProcessingException extends StripeWebhookException {
    public StripeEventProcessingException(String eventType, String message) {
        super("Failed to process Stripe event '" + eventType + "': " + message);
    }

    public StripeEventProcessingException(String eventType, String message, Throwable cause) {
        super("Failed to process Stripe event '" + eventType + "': " + message, cause);
    }
}