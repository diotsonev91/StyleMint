package bg.softuni.stylemint.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Standard error response format for all API errors
 * Used by GlobalExceptionHandler to ensure consistent error responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Short error identifier (e.g., "Sample not found")
     */
    private String error;

    /**
     * Detailed error message
     */
    private String message;

    /**
     * HTTP status code
     */
    private Integer status;

    /**
     * Request path where error occurred
     */
    private String path;

    /**
     * Timestamp of when error occurred
     */
    private Instant timestamp;

    /**
     * Additional error details (for validation errors)
     */
    private List<String> details;

    // ==================== Static Factory Methods ====================

    /**
     * Create error response with all fields
     */
    public static ErrorResponse of(String error, String message, int status, String path) {
        return new ErrorResponse(error, message, status, path, Instant.now(), null);
    }

    /**
     * Create error response without detailed message
     */
    public static ErrorResponse of(String error, int status, String path) {
        return new ErrorResponse(error, null, status, path, Instant.now(), null);
    }

    /**
     * Create error response with validation details
     */
    public static ErrorResponse withDetails(String error, String message, int status, String path, List<String> details) {
        return new ErrorResponse(error, message, status, path, Instant.now(), details);
    }
}