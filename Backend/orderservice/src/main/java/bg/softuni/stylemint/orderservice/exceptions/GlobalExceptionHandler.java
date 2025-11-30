package bg.softuni.stylemint.orderservice.exceptions;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.stylemint.orderservice.order.exceptions.InvalidProductTypeException;
import bg.softuni.stylemint.orderservice.payment.exceptions.StripeServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(StripeServiceException.class)
    public ResponseEntity<?> handleStripeServiceException(StripeServiceException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "PAYMENT_SERVICE_ERROR",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
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

            // Това ще се пренасочи към OrderExceptionHandler
            throw custom;
        }

        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "INVALID_JSON",
                "message", "Malformed JSON input"
        );

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {

        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (msg1, msg2) -> msg1 
                ));

        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "VALIDATION_ERROR",
                "details", errors
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