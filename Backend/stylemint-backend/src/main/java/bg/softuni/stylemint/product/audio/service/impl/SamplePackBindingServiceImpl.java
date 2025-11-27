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

@Service
@RequiredArgsConstructor
@Slf4j
public class SamplePackBindingServiceImpl implements SamplePackBindingService {

    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;
    private final SamplePackStatisticsService samplePackStatisticsService;

    @Override
    @Transactional
    public void bindSampleToPack(UUID sampleId, UUID packId, UUID authorId) {

        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to bind this sample");
        }

        if (!pack.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to modify this pack");
        }

        pack.addSample(sample);

        samplePackRepository.save(pack);

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
    public void unbindSampleFromPack(UUID sampleId, UUID packId, UUID authorId) {

        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to unbind this sample");
        }

        pack.removeSample(sample);

        samplePackRepository.save(pack);

        // Recalculate statistics
        samplePackStatisticsService.recalculatePackStatistics(pack);
        samplePackRepository.save(pack);

        log.info("Unbound sample '{}' from pack '{}'", sample.getName(), packId);
    }
}
