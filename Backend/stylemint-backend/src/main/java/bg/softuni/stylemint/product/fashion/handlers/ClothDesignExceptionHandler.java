package bg.softuni.stylemint.product.fashion.handlers;

import bg.softuni.stylemint.common.dto.ErrorResponse;
import bg.softuni.stylemint.product.fashion.exceptions.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice(basePackages = "bg.softuni.stylemint.product.fashion")
public class ClothDesignExceptionHandler {

    @ExceptionHandler(ClothDesignValidationException.class)
    public ResponseEntity<ErrorResponse> handleClothDesignValidation(ClothDesignValidationException ex, HttpServletRequest request) {
        log.warn("Cloth design validation failed: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
                "CLOTH_DESIGN_VALIDATION_ERROR",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ClothDesignNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClothDesignNotFound(ClothDesignNotFoundException ex, HttpServletRequest request) {
        log.warn("Cloth design not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
                "CLOTH_DESIGN_NOT_FOUND",
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler({ClothDesignProcessingException.class, ClothDesignUploadException.class})
    public ResponseEntity<ErrorResponse> handleClothDesignProcessing(Exception ex, HttpServletRequest request) {
        log.error("Cloth design processing failed: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
                "CLOTH_DESIGN_PROCESSING_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(CustomizationProcessingException.class)
    public ResponseEntity<ErrorResponse> handleCustomizationProcessing(CustomizationProcessingException ex, HttpServletRequest request) {
        log.error("Customization processing failed: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
                "CUSTOMIZATION_PROCESSING_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}