package bg.softuni.stylemint.external.exceptions.order;

import bg.softuni.stylemint.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice(basePackages = "bg.softuni.stylemint.user")
public class OrderServiceExceptionHandler {

    @ExceptionHandler(OrderServiceException.class)
    public ResponseEntity<ErrorResponse> handleOrderServiceErrors(
            OrderServiceException ex,
            HttpServletRequest request
    ) {
        // --------------------------
        // CASE: Order Service unavailable
        // --------------------------
        if (ex.getMessage() != null && ex.getMessage().contains("Connection refused")) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ErrorResponse.of(
                            "OrderServiceUnavailable",
                            "Order service is temporarily unavailable. Order history will be displayed when the service is back online.",
                            HttpStatus.SERVICE_UNAVAILABLE.value(),
                            request.getRequestURI()
                    ));
        }

        // --------------------------
        // CASE: Order Service timeout
        // --------------------------
        if (ex.getMessage() != null && (ex.getMessage().contains("timeout") || ex.getMessage().contains("Timeout"))) {
            return ResponseEntity
                    .status(HttpStatus.GATEWAY_TIMEOUT)
                    .body(ErrorResponse.of(
                            "OrderServiceTimeout",
                            "Order service request timed out. Please try again later.",
                            HttpStatus.GATEWAY_TIMEOUT.value(),
                            request.getRequestURI()
                    ));
        }

        // --------------------------
        // Default Order Service error
        // --------------------------
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(ErrorResponse.of(
                        "OrderServiceError",
                        "Unable to retrieve order information at this time. Please try again later.",
                        HttpStatus.BAD_GATEWAY.value(),
                        request.getRequestURI()
                ));
    }

    // ========================================
    // UNSUPPORTED PRODUCT TYPE
    // ========================================

    @ExceptionHandler(UnsupportedProductTypeException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedProductType(
            UnsupportedProductTypeException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        "UnsupportedProductType",
                        String.format("Product type '%s' is not supported. Valid types are: CLOTHES, SAMPLE, PACK",
                                ex.getProductType()),
                        HttpStatus.BAD_REQUEST.value(),
                        request.getRequestURI()
                ));
    }
}