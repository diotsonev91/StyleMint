package bg.softuni.stylemint.product.fashion.repository;

import java.util.UUID;

public interface LikeCountProjection {
    UUID getDesignId();
    long getCount();
}
