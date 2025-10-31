package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClothDesignServiceImpl implements ClothDesignService {

    private final ClothDesignRepository clothDesignRepository;

    @Override
    public long countDesignsByUser(UUID userId) {
        return clothDesignRepository.countByUserId(userId);
    }
}
