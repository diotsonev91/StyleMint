package bg.softuni.stylemint.external.exceptions.nft;

import bg.softuni.stylemint.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Order(1)
public class NftExceptionHandler {

    @ExceptionHandler(NftServiceException.class)
    public ResponseEntity<ErrorResponse> handleNftErrors(
            NftServiceException ex,
            HttpServletRequest request
    ) {

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
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        "NftServiceError",
                        ex.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(NftServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleNftDown(
            NftServiceUnavailableException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ErrorResponse.of(
                        "NftServiceUnavailable",
                        "NFT service is currently offline. Please try again later.",
                        HttpStatus.SERVICE_UNAVAILABLE.value(),
                        request.getRequestURI()
                ));
    }

}
