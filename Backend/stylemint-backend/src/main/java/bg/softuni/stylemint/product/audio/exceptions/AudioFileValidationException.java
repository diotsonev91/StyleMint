package bg.softuni.stylemint.product.audio.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class AudioFileValidationException extends DomainException {
    public AudioFileValidationException(String message) {
        super(message);
    }

    public AudioFileValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}