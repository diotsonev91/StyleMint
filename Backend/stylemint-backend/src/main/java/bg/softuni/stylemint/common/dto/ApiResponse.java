package bg.softuni.stylemint.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Generic wrapper for API responses
 * Used for operations that benefit from additional metadata (messages, timestamps)
 *
 * Usage examples:
 * - File uploads: ApiResponse.success(data, "File uploaded successfully")
 * - Actions: ApiResponse.successMessage("Download recorded")
 * - Simple operations: Don't use this, return DTO directly
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * The actual data payload
     */
    private T data;

    /**
     * Optional message for user feedback
     */
    private String message;

    /**
     * Timestamp of when response was created
     */
    private Instant timestamp;

    // ==================== Static Factory Methods ====================

    /**
     * Create success response with data only
     * @param data The response data
     * @return ApiResponse with data and timestamp
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null, Instant.now());
    }

    /**
     * Create success response with data and message
     * @param data The response data
     * @param message Success message
     * @return ApiResponse with data, message, and timestamp
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message, Instant.now());
    }

    /**
     * Create success response with message only (no data)
     * Used for actions like "download recorded", "rating updated"
     * @param message Success message
     * @return ApiResponse with message and timestamp
     */
    public static <T> ApiResponse<T> successMessage(String message) {
        return new ApiResponse<>(null, message, Instant.now());
    }
}