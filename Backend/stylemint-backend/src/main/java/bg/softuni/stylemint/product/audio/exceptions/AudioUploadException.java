package bg.softuni.stylemint.product.audio.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class AudioUploadException extends DomainException {
    public AudioUploadException(String message) {
        super(message);
    }

    public AudioUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}