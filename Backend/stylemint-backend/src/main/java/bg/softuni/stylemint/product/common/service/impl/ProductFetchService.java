package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductFetchService {
    // Repositories for fetching products
    private final ClothDesignRepository clothDesignRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;

    public BaseProduct fetchProduct(OrderItemRequestDTO item) {
        return switch (item.getProductType()) {
            case CLOTHES -> clothDesignRepository.findById(item.getProductId()).orElse(null);
            case SAMPLE -> audioSampleRepository.findById(item.getProductId()).orElse(null);
            case PACK -> samplePackRepository.findById(item.getProductId()).orElse(null);
            default -> null;
        };
    }

    public BaseProduct fetchProductByTypeAndId(String productType, UUID productId) {
        return switch (productType.toUpperCase()) {
            case "CLOTHES" -> clothDesignRepository.findById(productId).orElse(null);
            case "SAMPLE" -> audioSampleRepository.findById(productId).orElse(null);
            case "PACK" -> samplePackRepository.findById(productId).orElse(null);
            default -> null;
        };
    }
}
