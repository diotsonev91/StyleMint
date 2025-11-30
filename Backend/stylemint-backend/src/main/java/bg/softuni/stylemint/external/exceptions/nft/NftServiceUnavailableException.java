package bg.softuni.stylemint.external.exceptions.nft;

public class NftServiceUnavailableException extends RuntimeException {

    public NftServiceUnavailableException(String message) {
        super(message);
    }

    public NftServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}