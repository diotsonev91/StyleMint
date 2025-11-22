package bg.softuni.stylemint.product.fashion.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

public class ClothDesignUploadException extends DomainException {
    public ClothDesignUploadException(String message) {
        super(message);
    }

    public ClothDesignUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}