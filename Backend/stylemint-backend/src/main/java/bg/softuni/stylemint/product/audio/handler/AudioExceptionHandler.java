package bg.softuni.stylemint.product.audio.handler;


import bg.softuni.stylemint.common.dto.ErrorResponse;
import bg.softuni.stylemint.product.audio.exceptions.AudioFileValidationException;
import bg.softuni.stylemint.product.audio.exceptions.AudioProcessingException;
import bg.softuni.stylemint.product.audio.exceptions.AudioSampleNotFoundException;
import bg.softuni.stylemint.product.audio.exceptions.AudioUploadException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice(basePackages = "bg.softuni.stylemint.product.audio")
public class AudioExceptionHandler {

    @ExceptionHandler(AudioFileValidationException.class)
    public ResponseEntity<ErrorResponse> handleAudioValidation(AudioFileValidationException ex, HttpServletRequest request) {
        log.warn("Audio validation failed: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
                "AUDIO_VALIDATION_ERROR",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AudioSampleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAudioNotFound(AudioSampleNotFoundException ex, HttpServletRequest request) {
        log.warn("Audio sample not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
                "AUDIO_SAMPLE_NOT_FOUND",
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AudioUploadException.class)
    public ResponseEntity<ErrorResponse> handleAudioUpload(AudioUploadException ex, HttpServletRequest request) {
        log.error("Audio upload failed: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
                "AUDIO_UPLOAD_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(AudioProcessingException.class)
    public ResponseEntity<ErrorResponse> handleAudioProcessing(AudioProcessingException ex, HttpServletRequest request) {
        log.error("Audio processing failed: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
                "AUDIO_PROCESSING_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}