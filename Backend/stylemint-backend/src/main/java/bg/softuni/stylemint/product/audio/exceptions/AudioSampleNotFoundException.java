package bg.softuni.stylemint.product.audio.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

import java.util.UUID;

public class AudioSampleNotFoundException extends DomainException {
    public AudioSampleNotFoundException(UUID sampleId) {
        super("Audio sample not found with id: " + sampleId);
    }

    public AudioSampleNotFoundException(String message) {
        super(message);
    }

    public AudioSampleNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}