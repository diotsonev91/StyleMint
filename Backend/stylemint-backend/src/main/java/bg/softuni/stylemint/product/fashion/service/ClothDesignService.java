package bg.softuni.stylemint.product.fashion.service;

import java.util.UUID;

public interface ClothDesignService {
    long countDesignsByUser(UUID userId);
}
