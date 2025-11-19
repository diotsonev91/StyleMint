// NftServiceException.java
package bg.softuni.stylemint.external.facade.nft;

public class NftServiceException extends RuntimeException {

    public NftServiceException(String message) {
        super(message);
    }

    public NftServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}