package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class NonTransferableTokenException extends NftException {
    public NonTransferableTokenException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "NON_TRANSFERABLE_TOKEN");
    }

    public NonTransferableTokenException() {
        this("This NFT is not transferable");
    }
}
