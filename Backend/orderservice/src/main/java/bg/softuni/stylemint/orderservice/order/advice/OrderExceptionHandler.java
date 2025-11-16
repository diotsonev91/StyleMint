package bg.softuni.stylemint.orderservice.order.advice;

import bg.softuni.stylemint.orderservice.exceptions.*;
import bg.softuni.stylemint.orderservice.order.exceptions.InvalidProductTypeException;
import bg.softuni.stylemint.orderservice.order.exceptions.MissingDeliveryAddressException;
import bg.softuni.stylemint.orderservice.payment.exceptions.InvalidPaymentMethodException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Map;

@RestControllerAdvice(basePackages = "bg.softuni.stylemint.orderservice.controller")
public class OrderExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "NOT_FOUND",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MissingDeliveryAddressException.class)
    public ResponseEntity<?> handleMissingDeliveryAddress(MissingDeliveryAddressException ex) {
        Map<String, Object> body = Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "error", "DELIVERY_ADDRESS_REQUIRED",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

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
}