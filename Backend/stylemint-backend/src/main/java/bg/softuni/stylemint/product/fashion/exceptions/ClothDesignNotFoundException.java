package bg.softuni.stylemint.product.fashion.exceptions;

import bg.softuni.stylemint.common.exception.DomainException;

import java.util.UUID;

public class ClothDesignNotFoundException extends DomainException {
    public ClothDesignNotFoundException(UUID designId) {
        super("Cloth design not found with id: " + designId);
    }

    public ClothDesignNotFoundException(String message) {
        super(message);
    }

    public ClothDesignNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}