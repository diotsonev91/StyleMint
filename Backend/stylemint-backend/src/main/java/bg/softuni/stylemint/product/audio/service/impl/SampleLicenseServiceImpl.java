// File: SampleLicenseServiceImpl.java (FIXED - no Order entity)
package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.stylemint.common.exception.NotFoundException;

import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SampleLicense;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLicenseRepository;
import bg.softuni.stylemint.product.audio.service.SampleLicenseService;
import bg.softuni.stylemint.product.audio.service.utils.AudioSampleMapper;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SampleLicenseServiceImpl implements SampleLicenseService {
    private final SampleLicenseRepository licenseRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final OrderServiceFacade orderServiceFacade;
    private final UserService userService;
    private final AudioSampleMapper audioSampleMapper;

    @Transactional
    public void processOrderFulfillment(UUID orderId, UUID userId) {
        try {
            // Get order items DTOs from Order microservice via Facade
            List<OrderItemDTO> orderItems = orderServiceFacade.getOrderItems(orderId);
            log.info("Processing order fulfillment for order: {}, user: {}, items: {}", orderId, userId, orderItems.size());

            for (OrderItemDTO item : orderItems) {
                if (item.getProductType() == ProductType.SAMPLE) {
                    // Single sample purchase
                    grantSampleLicense(userId, item.getProductId(), item.getItemId());
                }
                else if (item.getProductType() == ProductType.PACK) {
                    // Pack purchase - license ALL samples in the pack
                    grantPackSampleLicenses(userId, item.getProductId(), item.getItemId());
                }
            }
        } catch (Exception e) {
            log.error("Error processing order fulfillment for order: {}", orderId, e);
            throw new RuntimeException("Failed to process order fulfillment", e);
        }
    }

    private void grantSampleLicense(UUID userId, UUID sampleId, UUID orderItemId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        if (!licenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)) {
            SampleLicense license = SampleLicense.builder()
                    .user(userService.getUserById(userId))
                    .audioSample(sample)
                    .orderItemId(orderItemId) // Only store the order item ID as reference
                    .purchasedAt(OffsetDateTime.now())
                    .build();

            licenseRepository.save(license);
            log.info("Granted sample license for user: {}, sample: {}", userId, sampleId);
        }
    }

    private void grantPackSampleLicenses(UUID userId, UUID packId, UUID orderItemId) {
        List<AudioSample> packSamples = audioSampleRepository.findByPackId(packId);

        for (AudioSample sample : packSamples) {
            if (!licenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId())) {
                SampleLicense license = SampleLicense.builder()
                        .user(userService.getUserById(userId))
                        .audioSample(sample)
                        .orderItemId(orderItemId) // Only store the order item ID as reference
                        .purchasedAt(OffsetDateTime.now())
                        .build();

                licenseRepository.save(license);
            }
        }
        log.info("Granted pack licenses for user: {}, pack: {}, samples: {}", userId, packId, packSamples.size());
    }

    public boolean canDownloadSample(UUID userId, UUID sampleId) {
        return licenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId);
    }

    public List<AudioSampleDTO> getUserSampleLibrary(UUID userId) {
        List<AudioSample> samples = licenseRepository.findAudioSamplesByUserId(userId);
        return samples.stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public boolean hasAccessToPackSamples(UUID userId, UUID packId) {
        List<AudioSample> packSamples = audioSampleRepository.findByPackId(packId);
        return packSamples.stream()
                .anyMatch(sample -> licenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId()));
    }

    public List<SampleLicense> getUserLicenses(UUID userId) {
        return licenseRepository.findByUserId(userId);
    }
}