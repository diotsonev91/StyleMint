package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class InvalidNftTypeException extends NftException {
    public InvalidNftTypeException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_NFT_TYPE");
    }

    public InvalidNftTypeException() {
        this("Invalid NFT type for this operation");
    }
}