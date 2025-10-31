package bg.softuni.stylemint.auth.exception;

import bg.softuni.stylemint.common.exception.DomainException;

public class MissingTokenException extends DomainException {
    public MissingTokenException(String message) {
        super(message);
    }

    public MissingTokenException() {
        super("Authentication token is missing");
    }
}