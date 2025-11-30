package bg.softuni.stylemint.product.audio.service;

import java.util.UUID;

public interface SamplePackRatingService {

    void updateUserPackRate(UUID packId,UUID userId, Double rating);

    Double getUserPackRate(UUID packId);

    void validateRate(Double rating);
}