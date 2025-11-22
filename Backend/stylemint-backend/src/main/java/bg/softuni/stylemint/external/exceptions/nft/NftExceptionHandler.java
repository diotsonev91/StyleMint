package bg.softuni.stylemint.external.exceptions.nft;

import bg.softuni.stylemint.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice(basePackages = "bg.softuni.stylemint.nft")
public class NftExceptionHandler {

    @ExceptionHandler(NftServiceException.class)
    public ResponseEntity<ErrorResponse> handleNftErrors(
            NftServiceException ex,
            HttpServletRequest request
    ) {

        // --------------------------
        // CASE: Certificate not allowed
        // --------------------------
        if ("CERTIFICATE_NOT_SUPPORTED".equals(ex.getMessage())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.of(
                            "CertificateNotAllowed",
                            "This NFT type does not support certificate generation.",
                            HttpStatus.BAD_REQUEST.value(),
                            request.getRequestURI()
                    ));
        }

        // --------------------------
        // Default NFT error
        // --------------------------
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        "NftServiceError",
                        ex.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        request.getRequestURI()
                ));
    }
}
