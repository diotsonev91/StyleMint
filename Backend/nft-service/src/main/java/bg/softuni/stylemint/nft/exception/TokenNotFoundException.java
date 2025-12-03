package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class TokenNotFoundException extends NftException {
    public TokenNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "TOKEN_NOT_FOUND");
    }

    public TokenNotFoundException() {
        this("Token not found");
    }
}

