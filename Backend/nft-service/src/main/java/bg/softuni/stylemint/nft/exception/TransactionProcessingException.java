package bg.softuni.stylemint.nft.exception;

import org.springframework.http.HttpStatus;

public class TransactionProcessingException extends NftException {
    public TransactionProcessingException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "TRANSACTION_PROCESSING_ERROR");
    }

    public TransactionProcessingException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "TRANSACTION_PROCESSING_ERROR", cause);
    }
}
