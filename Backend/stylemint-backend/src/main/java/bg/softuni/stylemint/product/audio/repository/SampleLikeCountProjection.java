package bg.softuni.stylemint.product.audio.repository;

import java.util.UUID;

public interface SampleLikeCountProjection {
    UUID getSampleId();
    long getCount();
}
