package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class InvalidOwnershipException extends NftException {
    public InvalidOwnershipException(String message) {
        super(message, HttpStatus.FORBIDDEN, "INVALID_OWNERSHIP");
    }

    public InvalidOwnershipException() {
        this("User does not own this token");
    }
}
