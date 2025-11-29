package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.stylemint.product.fashion.model.ClothDesign;

import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BonusPointsService {
    private final ClothDesignRepository clothDesignRepository;

    public int getUserBonusPoints(UUID userId) {
        return clothDesignRepository.findByUserId(userId)
                    .stream()
                    .mapToInt(ClothDesign::getBonusPoints)
                    .sum();
    }
}


