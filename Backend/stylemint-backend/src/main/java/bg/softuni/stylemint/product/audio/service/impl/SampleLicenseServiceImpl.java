// File: SampleLicenseServiceImpl.java (FIXED - no Order entity)
package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
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


    @Override
    public void validateDownloadPermission(UUID userId, UUID sampleId) {

        // 1) Проверка дали sample изобщо съществува
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() ->
                        new NotFoundException("Sample with ID " + sampleId + " does not exist.")
                );

        // 2) Проверка дали user е собственик
        boolean isOwner = sample.getAuthorId().equals(userId);

        if (isOwner) {
            return; // Собственик → винаги може да сваля
        }

        // 3) Проверка дали user има лиценз (купил е)
        boolean hasLicense = licenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId);

        if (!hasLicense) {
            throw new ForbiddenOperationException("You must purchase this sample before downloading it.");
        }

        // През тази точка минават само:
        // ✔ потребители, които са купили sample-а
        // ✔ или собствениците му
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

    // ADD TO SampleLicenseServiceImpl.java

    /**
     * Validate if user can download entire pack
     * User can download if:
     * 1. User is the pack author (owner)
     * 2. User has purchased the pack (has licenses for all samples in pack)
     */
    @Override
    public void validateDownloadPermissionPack(UUID userId, UUID packId) {

        // 1) Check if pack exists
        // (Assuming you have SamplePackRepository injected)
        // SamplePack pack = samplePackRepository.findById(packId)
        //     .orElseThrow(() -> new NotFoundException("Pack with ID " + packId + " does not exist."));

        // 2) Get all samples in this pack
        List<AudioSample> packSamples = audioSampleRepository.findByPackId(packId);

        if (packSamples.isEmpty()) {
            throw new NotFoundException("Pack with ID " + packId + " has no samples.");
        }

        // 3) Check if user is the author of ANY sample in pack (= pack owner)
        // All samples in a pack have the same author, so check first sample
        UUID packAuthorId = packSamples.get(0).getAuthorId();
        boolean isOwner = packAuthorId.equals(userId);

        if (isOwner) {
            log.info("✅ User {} is owner of pack {}", userId, packId);
            return; // Owner can always download
        }

        // 4) Check if user has license for ALL samples in pack
        boolean hasAllLicenses = packSamples.stream()
                .allMatch(sample -> licenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId()));

        if (!hasAllLicenses) {
            throw new ForbiddenOperationException(
                    "You must purchase this pack before downloading it. " +
                            "Some samples are not licensed."
            );
        }

        log.info("✅ User {} has licenses for all samples in pack {}", userId, packId);
    }

    @Override
    public void createLicenseForPaidItem(UUID userId, OrderItemDTO item) {
        if (item.getProductType() == ProductType.SAMPLE) {
            grantSampleLicense(userId, item.getProductId(), item.getItemId());
        }
        else if (item.getProductType() == ProductType.PACK) {
            grantPackSampleLicenses(userId, item.getProductId(), item.getItemId());
        }
    }


    public List<SampleLicense> getUserLicenses(UUID userId) {
        return licenseRepository.findByUserId(userId);
    }
}