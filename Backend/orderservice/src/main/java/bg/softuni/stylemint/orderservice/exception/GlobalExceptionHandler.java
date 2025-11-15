package bg.softuni.stylemint.orderservice.exception;

import bg.softuni.stylemint.orderservice.enums.ProductType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Missing delivery address (clothes case)
    @ExceptionHandler(MissingDeliveryAddressException.class)
    public ResponseEntity<?> handleMissingDeliveryAddress(MissingDeliveryAddressException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "DELIVERY_ADDRESS_REQUIRED",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // Invalid payment method (digital + cash)
    @ExceptionHandler(InvalidPaymentMethodException.class)
    public ResponseEntity<?> handleInvalidPaymentMethod(InvalidPaymentMethodException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INVALID_PAYMENT_METHOD",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(InvalidProductTypeException.class)
    public ResponseEntity<?> handleInvalidProductType(InvalidProductTypeException ex) {

        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INVALID_PRODUCT_TYPE",
                "message", ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }


    // Stripe service failed
    @ExceptionHandler(StripeServiceException.class)
    public ResponseEntity<?> handleStripeServiceException(StripeServiceException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "PAYMENT_SERVICE_ERROR",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "NOT_FOUND",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }


    // Generic invalid request errors
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INVALID_REQUEST",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleJsonMappingError(org.springframework.http.converter.HttpMessageNotReadableException ex) {


        if (ex.getMessage() != null && ex.getMessage().contains("ProductType")) {

            String allowed = String.join(", ",
                    Arrays.stream(ProductType.values())
                            .map(Enum::name)
                            .toList()
            );


            InvalidProductTypeException custom =
                    new InvalidProductTypeException("Invalid productType. Allowed values: " + allowed);

            return handleInvalidProductType(custom);
        }

        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INVALID_JSON",
                "message", "Malformed JSON input"
        );

        return ResponseEntity.badRequest().body(body);
    }


    // Catch-all error fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INTERNAL_SERVER_ERROR",
                "message", "An unexpected error occurred"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
