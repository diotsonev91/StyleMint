package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.FileProcessingException;
import bg.softuni.stylemint.common.service.CloudinaryService;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackBindingService;
import bg.softuni.stylemint.product.audio.service.SamplePackManagementService;
import bg.softuni.stylemint.product.audio.service.utils.FileSizeUtils;
import bg.softuni.stylemint.product.audio.service.utils.SamplePackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SamplePackManagementServiceImpl implements SamplePackManagementService {

    private final SamplePackRepository samplePackRepository;
    private final AudioSampleService audioSampleService;
    private final CloudinaryService cloudinaryService;
    private final SamplePackMapper samplePackMapper;
    private final SamplePackBindingService samplePackBindingService;

    // ================ PUBLIC METHODS ================

    @Transactional
    public SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request) {
        try {
            log.info("Starting pack upload for author: {}", authorId);

            // 1. Create the pack entity first (without samples)
            SamplePack pack = SamplePack.builder()
                    .title(request.getTitle())
                    .authorId(authorId)
                    .artist(request.getArtist())
                    .coverImage("temp")
                    .price(request.getPrice().doubleValue())
                    .sampleCount(request.getSamples().size())
                    .totalSize("Calculating...")
                    .description(request.getDescription())
                    .genres(request.getGenres())
                    .tags(request.getTags())
                    .rating(0.0)
                    .downloads(0)
                    .releaseDate(OffsetDateTime.now())
                    .salesCount(0L)
                    .build();

            SamplePack savedPack = samplePackRepository.saveAndFlush(pack);
            log.info("Created pack entity with ID: {}", savedPack.getId());

            // 2. Upload cover image to Cloudinary and update the image url
            String coverImageUrl = cloudinaryService.uploadPackCover(
                    request.getCoverImage(),
                    savedPack.getId()
            );
            savedPack.setCoverImage(coverImageUrl);
            log.info("Uploaded cover image for pack '{}'", savedPack.getTitle());

            // 3. Upload each NEW sample using AudioSampleService and bind to pack
            long totalSizeBytes = 0;
            if (request.getSamples() != null && !request.getSamples().isEmpty()) {
                totalSizeBytes = uploadAndBindSamples(savedPack, authorId, request.getSamples());
                log.info("Uploaded {} new samples for pack '{}'", request.getSamples().size(), savedPack.getTitle());
            }

            // 4. Bind existing samples if provided - USE SamplePackBindingService
            if (request.getExistingSamplesToAdd() != null && !request.getExistingSamplesToAdd().isEmpty()) {
                samplePackBindingService.bindSamplesToPack(savedPack.getId(), authorId, request.getExistingSamplesToAdd());
                log.info("Bound {} existing samples to pack '{}'",
                        request.getExistingSamplesToAdd().size(), savedPack.getTitle());
            }

            // 5. Update pack with calculated total size and recalculate statistics
            savedPack.setTotalSize(FileSizeUtils.formatFileSize(totalSizeBytes));
            savedPack.setSampleCount( audioSampleService.countSamplesByPack(savedPack.getId()));
            recalculatePackStatistics(savedPack);
            samplePackRepository.save(savedPack);

            log.info("Successfully uploaded pack '{}' with {} samples",
                    savedPack.getTitle(), savedPack.getSampleCount());

            return samplePackMapper.toDTO(savedPack);

        } catch (Exception e) {
            log.error("Failed to upload sample pack: {}", e.getMessage(), e);
            throw new FileProcessingException("Failed to upload sample pack: " + e.getMessage());
        }
    }

    @Transactional
    public SamplePackDTO updatePack(UUID packId, UUID authorId, UpdatePackRequest request) {
        // 1. Find and validate pack ownership
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found with ID: " + packId));

        if (!pack.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("You are not authorized to update this pack");
        }

        try {
            log.info("Updating pack '{}' (ID: {})", pack.getTitle(), packId);

            // 2. Update basic metadata (only if provided - null-safe)
            if (request.getTitle() != null) {
                pack.setTitle(request.getTitle());
            }
            if (request.getArtist() != null) {
                pack.setArtist(request.getArtist());
            }
            if (request.getPrice() != null) {
                pack.setPrice(request.getPrice().doubleValue());
            }
            if (request.getDescription() != null) {
                pack.setDescription(request.getDescription());
            }
            if (request.getGenres() != null && !request.getGenres().isEmpty()) {
                pack.setGenres(request.getGenres());
            }
            if (request.getTags() != null) {
                pack.setTags(request.getTags());
            }

            // 3. Update cover image if provided
            if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
                String oldCoverUrl = pack.getCoverImage();

                log.info("Uploading new cover image for pack '{}'", pack.getTitle());
                String newCoverUrl = cloudinaryService.uploadPackCover(request.getCoverImage(), packId);
                pack.setCoverImage(newCoverUrl);

                // Delete old cover image (with validation)
                if (oldCoverUrl != null && !oldCoverUrl.isEmpty() && !oldCoverUrl.equals("temp")) {
                    try {
                        cloudinaryService.deleteFile(oldCoverUrl);
                        log.info("Deleted old cover image");
                    } catch (Exception e) {
                        log.warn("Failed to delete old cover image: {}", e.getMessage());
                    }
                }
            }

            // 4. Handle sample modifications
            long additionalSizeBytes = 0;

            // 4.1 Add NEW samples (with file upload)
            if (request.getSamplesToAdd() != null && !request.getSamplesToAdd().isEmpty()) {
                log.info("Adding {} new samples to pack '{}'",
                        request.getSamplesToAdd().size(), pack.getTitle());
                additionalSizeBytes += uploadAndBindSamples(pack, authorId, request.getSamplesToAdd());
            }

            // 4.2 Add EXISTING samples (already uploaded, just bind them)
            if (request.getExistingSamplesToAdd() != null && !request.getExistingSamplesToAdd().isEmpty()) {
                log.info("Binding {} existing samples to pack '{}'",
                        request.getExistingSamplesToAdd().size(), pack.getTitle());

                samplePackBindingService.bindSamplesToPack(pack.getId(), authorId, request.getExistingSamplesToAdd());
            }

            // 4.3 Remove samples from pack
            if (request.getSamplesToRemove() != null && !request.getSamplesToRemove().isEmpty()) {
                log.info("Removing {} samples from pack '{}'",
                        request.getSamplesToRemove().size(), pack.getTitle());

                for (UUID sampleId : request.getSamplesToRemove()) {
                    samplePackBindingService.unbindSampleFromPack(sampleId, authorId);
                }
            }

            // 4.4 Update individual sample pricing
            if (request.getSamplePricing() != null && !request.getSamplePricing().isEmpty()) {
                log.info("Updating pricing for {} samples in pack '{}'",
                        request.getSamplePricing().size(), pack.getTitle());

                for (Map.Entry<UUID, BigDecimal> entry : request.getSamplePricing().entrySet()) {
                    UUID sampleId = entry.getKey();
                    BigDecimal newPrice = entry.getValue();
                    audioSampleService.updateSamplePrice(sampleId, authorId, newPrice.doubleValue());
                }
            }

            // 5. Recalculate pack statistics
            log.info("Recalculating statistics for pack '{}'", pack.getTitle());
            recalculatePackStatistics(pack);

            // Update total size if new samples were added
            if (additionalSizeBytes > 0) {
                updateTotalSize(pack, additionalSizeBytes);
            }

            // 6. Save and return
            SamplePack updatedPack = samplePackRepository.save(pack);
            log.info("Successfully updated pack '{}' with {} samples",
                    updatedPack.getTitle(), updatedPack.getSampleCount());

            return samplePackMapper.toDTO(updatedPack);

        } catch (NotFoundException | ForbiddenOperationException e) {
            // Re-throw auth/not-found errors as-is
            throw e;
        } catch (Exception e) {
            log.error("Failed to update pack '{}': {}", pack.getTitle(), e.getMessage(), e);
            throw new FileProcessingException("Failed to update sample pack: " + e.getMessage());
        }
    }

    @Transactional
    public void deletePack(UUID packId, UUID authorId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found with ID: " + packId));

        if (!pack.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("You are not authorized to delete this pack");
        }

        try {
            log.info("Deleting pack '{}' (ID: {})", pack.getTitle(), packId);

            // Get all samples in the pack and unbind/delete them
            List<AudioSampleDTO> packSamples = audioSampleService.getSamplesByPack(packId);

            for (AudioSampleDTO sample : packSamples) {
                // Unbind sample from pack (make it standalone)
                samplePackBindingService.unbindSampleFromPack(sample.getId(), authorId);
                // Delete the sample
                audioSampleService.deleteSample(sample.getId(), authorId);
            }
            log.info("Deleted {} samples from pack '{}'", packSamples.size(), pack.getTitle());

            // Delete cover image from Cloudinary
            if (pack.getCoverImage() != null && !pack.getCoverImage().isEmpty() && !pack.getCoverImage().equals("temp")) {
                try {
                    cloudinaryService.deleteFile(pack.getCoverImage());
                    log.info("Deleted cover image for pack '{}'", pack.getTitle());
                } catch (Exception e) {
                    log.warn("Failed to delete cover image: {}", e.getMessage());
                }
            }

            // Delete pack entity
            samplePackRepository.delete(pack);

            log.info("Successfully deleted pack '{}' and its {} samples", pack.getTitle(), packSamples.size());

        } catch (NotFoundException | ForbiddenOperationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete pack '{}': {}", pack.getTitle(), e.getMessage(), e);
            throw new FileProcessingException("Failed to delete sample pack: " + e.getMessage());
        }
    }

    // ================ PRIVATE HELPER METHODS ================

    /**
     * Upload new samples and bind them to pack
     */
    private long uploadAndBindSamples(SamplePack pack, UUID authorId, List<PackSampleInfo> samples) {
        long totalSizeBytes = 0;

        for (PackSampleInfo sampleInfo : samples) {
            try {
                // Create upload request
                UploadSampleRequest uploadRequest = createUploadRequest(
                        sampleInfo,
                        pack.getArtist(),
                        pack.getGenres().isEmpty() ? null : pack.getGenres().get(0)
                );

                // Upload sample using AudioSampleService
                AudioSampleDTO uploadedSample = audioSampleService.uploadSample(authorId, uploadRequest);

                // FIX: Correct parameter order - (sampleId, packId, authorId)
                samplePackBindingService.bindSampleToPack(uploadedSample.getId(), pack.getId(), authorId);

                // Track total size
                totalSizeBytes += sampleInfo.getFile().getSize();

                log.debug("Uploaded and bound sample '{}' to pack '{}'", sampleInfo.getName(), pack.getTitle());

            } catch (Exception e) {
                log.error("Failed to upload sample '{}': {}", sampleInfo.getName(), e.getMessage());
                throw new FileProcessingException("Failed to upload sample '" + sampleInfo.getName() + "': " + e.getMessage());
            }
        }

        return totalSizeBytes;
    }

    /**
     * Create UploadSampleRequest from PackSampleInfo
     */
    private UploadSampleRequest createUploadRequest(PackSampleInfo sampleInfo, String artist, Genre genre) {
        UploadSampleRequest uploadRequest = new UploadSampleRequest();
        uploadRequest.setFile(sampleInfo.getFile());
        uploadRequest.setName(sampleInfo.getName());
        uploadRequest.setArtist(artist);

        // Use individual price if provided, otherwise zero
        uploadRequest.setPrice(sampleInfo.getIndividualPrice() != null
                ? sampleInfo.getIndividualPrice()
                : BigDecimal.ZERO);

        uploadRequest.setBpm(sampleInfo.getBpm() != null ? sampleInfo.getBpm() : 0);
        uploadRequest.setMusicalKey(sampleInfo.getMusicalKey());
        uploadRequest.setMusicalScale(sampleInfo.getMusicalScale());
        uploadRequest.setGenre(genre);
        uploadRequest.setSampleType(sampleInfo.getSampleType());
        uploadRequest.setInstrumentGroup(sampleInfo.getInstrumentGroup());

        return uploadRequest;
    }

    /**
     * Recalculate pack statistics (sample count, average BPM, total duration)
     */
    private void recalculatePackStatistics(SamplePack pack) {
        List<AudioSampleDTO> packSamples = audioSampleService.getSamplesByPack(pack.getId());

        if (!packSamples.isEmpty()) {
            // Update sample count
            pack.setSampleCount(packSamples.size());

            // Calculate average BPM
            Double averageBpm = packSamples.stream()
                    .filter(sample -> sample.getBpm() != null && sample.getBpm() > 0)
                    .mapToInt(AudioSampleDTO::getBpm)
                    .average()
                    .orElse(0.0);

            // Calculate total duration
            Integer totalDuration = packSamples.stream()
                    .filter(sample -> sample.getDuration() != null && sample.getDuration() > 0)
                    .mapToInt(AudioSampleDTO::getDuration)
                    .sum();

            log.debug("Pack '{}' statistics: {} samples, avg BPM: {}, total duration: {}s",
                    pack.getTitle(), pack.getSampleCount(), averageBpm, totalDuration);
        } else {
            pack.setSampleCount(0);
            log.debug("Pack '{}' has no samples", pack.getTitle());
        }
    }

    /**
     * Update pack total size by adding additional bytes
     */
    private void updateTotalSize(SamplePack pack, long additionalBytes) {
        try {
            long currentBytes = FileSizeUtils.parseFileSize(pack.getTotalSize());
            long totalBytes = currentBytes + additionalBytes;
            pack.setTotalSize(FileSizeUtils.formatFileSize(totalBytes));

            log.debug("Updated pack '{}' total size to {}", pack.getTitle(), pack.getTotalSize());
        } catch (Exception e) {
            log.warn("Failed to parse existing pack size '{}', using only new size", pack.getTotalSize());
            pack.setTotalSize(FileSizeUtils.formatFileSize(additionalBytes));
        }
    }
}