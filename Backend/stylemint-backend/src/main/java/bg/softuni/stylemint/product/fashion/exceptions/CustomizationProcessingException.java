package bg.softuni.stylemint.product.fashion.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class CustomizationProcessingException extends DomainException {
    public CustomizationProcessingException(String message) {
        super(message);
    }

    public CustomizationProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}