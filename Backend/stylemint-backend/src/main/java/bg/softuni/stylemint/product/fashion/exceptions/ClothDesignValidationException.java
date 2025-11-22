package bg.softuni.stylemint.product.fashion.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

import java.util.UUID;

public class ClothDesignValidationException extends DomainException {
    public ClothDesignValidationException(String message) {
        super(message);
    }

    public ClothDesignValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}