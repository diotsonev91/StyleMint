package bg.softuni.stylemint.nft.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class NftException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public NftException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public NftException(String message, HttpStatus status, String errorCode, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }
}