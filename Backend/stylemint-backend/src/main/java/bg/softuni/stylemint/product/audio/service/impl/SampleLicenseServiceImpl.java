package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.order.enums.ProductType;
import bg.softuni.stylemint.order.model.Order;
import bg.softuni.stylemint.order.model.OrderItem;
import bg.softuni.stylemint.order.service.OrderService;
import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SampleLicense;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLicenseRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.utils.AudioSampleMapper; // ADD THIS IMPORT
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SampleLicenseServiceImpl {
    private final SampleLicenseRepository licenseRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final AudioSampleService audioSampleService;
    private final OrderService orderService;
    private final UserService userService;
    private final AudioSampleMapper audioSampleMapper;

    @Transactional
    public void processOrderFulfillment(Order order) {
        // Get order items for this order using OrderService
        List<OrderItem> orderItems = orderService.findOrderItemsByOrderId(order.getId());

        for (OrderItem item : orderItems) {
            if (item.getProductType() == ProductType.SAMPLE) {
                // Single sample purchase
                grantSampleLicense(order.getUserId(), item.getProductId(), item);
            }
            else if (item.getProductType() == ProductType.PACK) {
                // Pack purchase - license ALL samples in the pack
                grantPackSampleLicenses(order.getUserId(), item.getProductId(), item);
            }
        }
    }

    private void grantSampleLicense(UUID userId, UUID sampleId, OrderItem orderItem) {
        // Use repository to get the entity for license creation
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        // Check if license already exists (prevent duplicates)
        if (!licenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)) {
            SampleLicense license = SampleLicense.builder()
                    .user(userService.getUserById(userId))
                    .audioSample(sample)
                    .orderItem(orderItem)
                    .purchasedAt(OffsetDateTime.now())
                    .build();

            licenseRepository.save(license);
        }
    }

    private void grantPackSampleLicenses(UUID userId, UUID packId, OrderItem orderItem) {
        // Use repository to get entities for license creation
        List<AudioSample> packSamples = audioSampleRepository.findByPackId(packId);

        for (AudioSample sample : packSamples) {
            // Check if license already exists for each sample
            if (!licenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId())) {
                SampleLicense license = SampleLicense.builder()
                        .user(userService.getUserById(userId))
                        .audioSample(sample)
                        .orderItem(orderItem)
                        .purchasedAt(OffsetDateTime.now())
                        .build();

                licenseRepository.save(license);
            }
        }
    }

    public boolean canDownloadSample(UUID userId, UUID sampleId) {
        return licenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId);
    }

    // Return DTOs for the user's sample library using the mapper
    public List<AudioSampleDTO> getUserSampleLibrary(UUID userId) {
        List<AudioSample> samples = licenseRepository.findAudioSamplesByUserId(userId);

        // Convert entities to DTOs using the mapper
        return samples.stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Optional: Check if user owns any samples from a specific pack
    public boolean hasAccessToPackSamples(UUID userId, UUID packId) {
        List<AudioSample> packSamples = audioSampleRepository.findByPackId(packId);
        return packSamples.stream()
                .anyMatch(sample -> licenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId()));
    }

    // Get licenses for a user (if needed)
    public List<SampleLicense> getUserLicenses(UUID userId) {
        return licenseRepository.findByUserId(userId);
    }
}