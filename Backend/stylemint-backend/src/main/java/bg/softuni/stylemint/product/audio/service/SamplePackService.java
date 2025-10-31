package bg.softuni.stylemint.product.audio.service;

import java.util.UUID;

public interface SamplePackService {
    long countPacksByAuthor(UUID authorId);
}
