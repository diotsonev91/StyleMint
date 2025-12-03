package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class CertificateGenerationException extends NftException {
    public CertificateGenerationException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "CERTIFICATE_GENERATION_ERROR");
    }

    public CertificateGenerationException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "CERTIFICATE_GENERATION_ERROR", cause);
    }
}