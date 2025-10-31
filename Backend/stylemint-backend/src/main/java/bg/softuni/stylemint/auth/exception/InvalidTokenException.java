package bg.softuni.stylemint.auth.exception;

import bg.softuni.stylemint.common.exception.DomainException;

public class InvalidTokenException extends DomainException {
    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException() {
        super("Invalid or expired token");
    }
}