package bg.softuni.stylemint.auth.exception;

import bg.softuni.stylemint.common.exception.DomainException;

public class InvalidCredentialsException extends DomainException {
    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}