package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackStatisticsService;
import bg.softuni.stylemint.product.audio.service.utils.FileSizeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SamplePackStatisticsServiceImpl implements SamplePackStatisticsService {

    private final AudioSampleService audioSampleService;

    @Override
    @Transactional
    public void recalculatePackStatistics(SamplePack pack) {
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

    @Override
    @Transactional
    public void updateTotalSize(SamplePack pack, long additionalBytes) {
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
