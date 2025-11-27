package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;

import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.PackLicense;
import bg.softuni.stylemint.product.audio.model.SampleLicense;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.PackLicenseRepository;
import bg.softuni.stylemint.product.audio.repository.SampleLicenseRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.DigitalLicenseService;
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
public class DigitalLicenseServiceImpl implements DigitalLicenseService {

    private final PackLicenseRepository packLicenseRepository;
    private final SampleLicenseRepository sampleLicenseRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;
    private final OrderServiceFacade orderServiceFacade;
    private final UserService userService;
    private final AudioSampleMapper audioSampleMapper;

    /* ==========================================================
       ORDER FULFILLMENT
       ========================================================== */
    @Transactional
    public void processOrderFulfillment(UUID orderId, UUID userId) {

        List<OrderItemDTO> orderItems = orderServiceFacade.getOrderItems(orderId);
        log.info("Processing fulfillment: order={}, user={}, items={}",
                orderId, userId, orderItems.size());

        for (OrderItemDTO item : orderItems) {

            if (item.getProductType() == ProductType.SAMPLE) {
                grantSampleLicense(userId, item.getProductId(), item.getItemId());
            }

            else if (item.getProductType() == ProductType.PACK) {
                grantPackSampleLicenses(userId, item.getProductId(), item.getItemId());
            }
        }
    }

    /* ==========================================================
       GRANT LICENSES
       ========================================================== */

    private void grantSampleLicense(UUID userId, UUID sampleId, UUID orderItemId) {

        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        if (!sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId)) {

            SampleLicense license = SampleLicense.builder()
                    .user(userService.getUserById(userId))
                    .audioSample(sample)
                    .orderItemId(orderItemId)
                    .purchasedAt(OffsetDateTime.now())
                    .archived(false)
                    .build();

            sampleLicenseRepository.save(license);
            log.info("Granted sample license for user={}, sample={}", userId, sampleId);
        }
    }

    private void grantPackSampleLicenses(UUID userId, UUID packId, UUID orderItemId) {

        // grant PACK license
        if (!packLicenseRepository.existsByUserIdAndPackId(userId, packId)) {

            PackLicense packLicense = PackLicense.builder()
                    .user(userService.getUserById(userId))
                    .packId(packId)
                    .orderItemId(orderItemId)
                    .purchasedAt(OffsetDateTime.now())
                    .archived(false)
                    .build();

            packLicenseRepository.save(packLicense);
            log.info("✔ Granted PACK license → user={}, pack={}", userId, packId);
        }

        // grant individual sample licenses
        SamplePack pack = samplePackRepository.fetchPackWithSamples(packId);

        if (pack == null) {
            throw new NotFoundException("Sample pack not found: " + packId);
        }

        List<AudioSample> samples = pack.getSamples();

        for (AudioSample sample : samples) {

            if (!sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sample.getId())) {

                SampleLicense license = SampleLicense.builder()
                        .user(userService.getUserById(userId))
                        .audioSample(sample)
                        .orderItemId(orderItemId)
                        .purchasedAt(OffsetDateTime.now())
                        .archived(false)
                        .build();

                sampleLicenseRepository.save(license);
            }
        }

        log.info("✔ Granted {} SAMPLE licenses → user={}, pack={}",
                samples.size(), userId, packId);
    }


    /* ==========================================================
       DOWNLOAD VALIDATION (archived DOES NOT MATTER)
       ========================================================== */

    @Override
    public void validateDownloadPermissionSample(UUID userId, UUID sampleId) {

        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample with ID " + sampleId + " does not exist."));

        if (sample.getAuthorId().equals(userId)) {
            return; // owner always has access
        }

        boolean hasLicense = sampleLicenseRepository.existsByUserIdAndAudioSampleId(userId, sampleId);

        if (!hasLicense) {
            throw new ForbiddenOperationException("You must purchase this sample before downloading it.");
        }
    }

    @Override
    public void validateDownloadPermissionPack(UUID userId, UUID packId) {

        boolean hasLicense = packLicenseRepository.existsByUserIdAndPackId(userId, packId);

        if (!hasLicense) {
            throw new ForbiddenOperationException("You must purchase this pack before downloading it.");
        }

        log.info("User {} has pack access {}", userId, packId);
    }


    /* ==========================================================
       LIBRARY
       ========================================================== */
    @Override
    public List<AudioSampleDTO> getUserSampleLibrary(UUID userId) {

        List<AudioSample> samples = sampleLicenseRepository
                .findAudioSamplesByUserIdAndArchivedFalse(userId);

        return samples.stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SampleLicense> getUserLicenses(UUID userId) {
        return sampleLicenseRepository.findByUserId(userId);
    }


    /* ==========================================================
       DELETE LICENSE (SOFT DELETE)
       ========================================================== */

    @Transactional
    public void deleteSampleLicense(UUID userId, UUID sampleId) {

        SampleLicense license = sampleLicenseRepository
                .findByUserIdAndAudioSampleId(userId, sampleId)
                .orElseThrow(() -> new NotFoundException("License not found"));

        license.setArchived(true);
        license.setArchivedAt(OffsetDateTime.now());

        sampleLicenseRepository.save(license);

        log.info("🗑 Archived SAMPLE license → user={}, sample={}", userId, sampleId);
    }

    @Transactional
    public void deletePackLicense(UUID userId, UUID packId) {

        PackLicense license = packLicenseRepository
                .findByUserIdAndPackId(userId, packId)
                .orElseThrow(() -> new NotFoundException("Pack license not found"));

        license.setArchived(true);
        license.setArchivedAt(OffsetDateTime.now());

        packLicenseRepository.save(license);

        log.info("🗑 Archived PACK license → user={}, pack={}", userId, packId);
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

}
