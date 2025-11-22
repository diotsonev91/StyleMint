package bg.softuni.stylemint.product.fashion.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class ClothDesignProcessingException extends DomainException {
    public ClothDesignProcessingException(String message) {
        super(message);
    }

    public ClothDesignProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}