package bg.softuni.stylemint.orderservice.webhook.advice;

import bg.softuni.stylemint.orderservice.payment.exceptions.InvalidStripeSignatureException;
import bg.softuni.stylemint.orderservice.payment.exceptions.StripeEventProcessingException;
import bg.softuni.stylemint.orderservice.webhook.exceptions.StripeWebhookException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "bg.softuni.stylemint.orderservice.webhook")
@Slf4j
public class StripeWebhookExceptionHandler {

    @ExceptionHandler(InvalidStripeSignatureException.class)
    public ResponseEntity<String> handleInvalidSignature(InvalidStripeSignatureException ex) {
        log.warn("Invalid Stripe signature: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid signature");
    }

    @ExceptionHandler(StripeEventProcessingException.class)
    public ResponseEntity<String> handleEventProcessing(StripeEventProcessingException ex) {
        log.error("Error processing Stripe event: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body("Event processing failed");
    }


    @ExceptionHandler(StripeWebhookException.class)
    public ResponseEntity<String> handleGenericStripeWebhook(StripeWebhookException ex) {
        log.error("Stripe webhook error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Webhook processing error");
    }
}