package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.SamplePackBindingService;
import bg.softuni.stylemint.product.audio.service.SamplePackStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SamplePackBindingServiceImpl implements SamplePackBindingService {

    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;

    private final SamplePackStatisticsService samplePackStatisticsService;

    @Override
    @Transactional
    public void bindSampleToPack(UUID sampleId, UUID packId, UUID authorId) {
        // Get sample entity
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        // Get pack entity - fetch fresh from DB to ensure managed state
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        // Authorization checks
        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to bind this sample");
        }

        if (!pack.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to modify this pack");
        }

        // Set the relationship
        sample.setPack(pack);

        // Save and flush to ensure immediate persistence
        audioSampleRepository.saveAndFlush(sample);

        log.info("Bound sample '{}' (ID: {}) to pack '{}' (ID: {})",
                sample.getName(), sampleId, pack.getTitle(), packId);
    }

    @Override
    @Transactional
    public void bindSamplesToPack(UUID packId, UUID authorId, List<UUID> sampleIds) {
        log.info("Binding {} samples to pack ID: {}", sampleIds.size(), packId);
        sampleIds.forEach(sampleId -> bindSampleToPack(sampleId, packId, authorId));
        log.info("Successfully bound all {} samples to pack", sampleIds.size());
    }


    @Override
    @Transactional
    public void unbindSampleFromPack(UUID sampleId,UUID packId, UUID authorId) {
        // Get sample entity
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to unbind this sample");
        }


        // Remove pack reference
        sample.setPack(null);
        audioSampleRepository.save(sample);

        //recalculate pack count
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));
        samplePackStatisticsService.recalculatePackStatistics(pack);
        samplePackRepository.save(pack);

        log.info("Unbound sample '{}' from its pack", sample.getName());
    }
}