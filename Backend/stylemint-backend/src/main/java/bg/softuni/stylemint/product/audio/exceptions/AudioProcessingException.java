package bg.softuni.stylemint.product.audio.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class AudioProcessingException extends DomainException {
    public AudioProcessingException(String message) {
        super(message);
    }

    public AudioProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
