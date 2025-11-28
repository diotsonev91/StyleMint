package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.exceptions.AudioFileValidationException;
import bg.softuni.stylemint.product.audio.exceptions.AudioProcessingException;
import bg.softuni.stylemint.product.audio.exceptions.AudioSampleNotFoundException;
import bg.softuni.stylemint.product.audio.exceptions.AudioUploadException;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.FileProcessingException;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import bg.softuni.stylemint.product.audio.service.utils.AudioSampleMapper;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.util.UserRolesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AudioSampleServiceImpl implements AudioSampleService {

    private final AudioSampleRepository audioSampleRepository;
    private final CloudinaryService cloudinaryService;
    private final AudioSampleMapper audioSampleMapper;
    private final UserRolesService userRolesService;

    @Override
    @Transactional
    public AudioSampleDTO uploadSample(UUID authorId, UploadSampleRequest request) {
        MultipartFile file = request.getFile();

        if (file == null || file.isEmpty()) {
            throw new AudioFileValidationException("Audio file is required");
        }

        validateAudioFile(file);

        try {
            Map<String, Object> uploadResult = cloudinaryService.uploadAudio(file, authorId);

            String audioUrl = (String) uploadResult.get("url");
            Double durationInSeconds = (Double) uploadResult.get("duration");
            Integer duration = durationInSeconds != null ? durationInSeconds.intValue() : null;

            log.info("Uploaded audio: URL={}, Duration={} seconds", audioUrl, duration);

            AudioSample sample = AudioSample.builder()
                    .name(request.getName())
                    .authorId(authorId)
                    .artist(request.getArtist())
                    .audioUrl(audioUrl)
                    .duration(duration)
                    .bpm(request.getBpm())
                    .key(request.getMusicalKey())
                    .scale(request.getMusicalScale())
                    .genre(request.getGenre())
                    .instrumentGroup(request.getInstrumentGroup())
                    .sampleType(request.getSampleType())
                    .price(request.getPrice().doubleValue())
                    .tags(request.getTags())
                    .salesCount(0L)
                    .build();

            AudioSample saved = audioSampleRepository.save(sample);
            userRolesService.addRoleToUser(authorId, UserRole.AUTHOR);
            return audioSampleMapper.toDTO(saved);
        } catch (Exception e) {
            log.error("Failed to upload audio sample", e);
            throw new AudioUploadException("Failed to upload audio sample: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AudioSampleDTO updateSample(UUID sampleId, UUID authorId, UploadSampleRequest request) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new AudioSampleNotFoundException(sampleId));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to update this sample");
        }

        try {
            ApplySampleBaseUpdates(sample, request.getName(), request.getArtist(), request.getBpm(),
                    request.getMusicalKey(), request.getMusicalScale(), request.getGenre(),
                    request.getInstrumentGroup(), request.getSampleType(), request.getPrice(), request.getTags());

            if (request.getFile() != null && !request.getFile().isEmpty()) {
                validateAudioFile(request.getFile());

                String oldUrl = sample.getAudioUrl();

                Map<String, Object> uploadResult = cloudinaryService.uploadAudio(request.getFile(), authorId);
                String newAudioUrl = (String) uploadResult.get("url");
                Double durationInSeconds = (Double) uploadResult.get("duration");
                Integer newDuration = durationInSeconds != null ? durationInSeconds.intValue() : null;

                sample.setAudioUrl(newAudioUrl);
                sample.setDuration(newDuration);

                if (oldUrl != null) {
                    cloudinaryService.deleteFile(oldUrl);
                }
            }

            AudioSample updated = audioSampleRepository.save(sample);
            return audioSampleMapper.toDTO(updated);
        } catch (Exception e) {
            log.error("Failed to update audio sample", e);
            throw new FileProcessingException("Failed to update audio sample: " + e.getMessage());
        }
    }

    private void ApplySampleBaseUpdates(AudioSample sample, String name, String artist, Integer bpm, MusicalKey musicalKey,
                                        MusicalScale musicalScale, Genre genre, InstrumentGroup instrumentGroup,
                                        SampleType sampleType, BigDecimal price, List<String> tags) {
        sample.setName(name);
        sample.setArtist(artist);
        sample.setBpm(bpm);
        sample.setKey(musicalKey);
        sample.setScale(musicalScale);
        sample.setGenre(genre);
        sample.setInstrumentGroup(instrumentGroup);
        sample.setSampleType(sampleType);
        sample.setPrice(price.doubleValue());
        sample.setTags(tags);
    }

    @Override
    @Transactional
    public AudioSampleDTO updateSampleMetadata(UUID sampleId, UUID authorId, UpdateSampleRequest request) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new AudioSampleNotFoundException(sampleId));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to update this sample");
        }

        try {
            ApplySampleBaseUpdates(sample, request.getName(), request.getArtist(), request.getBpm(),
                    request.getMusicalKey(), request.getMusicalScale(), request.getGenre(),
                    request.getInstrumentGroup(), request.getSampleType(), request.getPrice(), request.getTags());

            AudioSample updated = audioSampleRepository.save(sample);
            return audioSampleMapper.toDTO(updated);
        } catch (Exception e) {
            log.error("Failed to update audio sample metadata", e);
            throw new AudioProcessingException("Failed to update audio sample metadata: " + e.getMessage(), e);
        }
    }

    @Override
    public AudioSampleDTO getSampleById(UUID sampleId) {
        AudioSample sample = audioSampleRepository.findByIdAndArchivedFalse(sampleId)
                .orElseThrow(() -> new AudioSampleNotFoundException(sampleId));
        return audioSampleMapper.toDTO(sample);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 0 1 1 *")
    public void deleteArchivedSamples() {

        List<AudioSample> archivedSamples = audioSampleRepository.findByArchivedTrue();


        OffsetDateTime oneYearAgo = OffsetDateTime.now().minusYears(1);
        archivedSamples.stream()
                .filter(sample -> sample.getArchivedAt().isBefore(oneYearAgo))
                .forEach(sample -> {

                    audioSampleRepository.delete(sample);
                    log.info("Deleted archived sample with ID {}", sample.getId());
                });
    }

    @Override
    public List<AudioSampleDTO> getSamplesByAuthor(UUID authorId) {
        return audioSampleRepository.findByAuthorIdAndArchivedFalse(authorId).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AudioSampleDTO> getSamplesByGenre(Genre genre, Pageable pageable) {
        return audioSampleRepository.findByGenreAndArchivedFalse(genre, pageable)
                .map(audioSampleMapper::toDTO);
    }

    @Override
    public List<AudioSampleDTO> getSamplesByType(SampleType sampleType) {
        return audioSampleRepository.findBySampleTypeAndArchivedFalse(sampleType).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByInstrumentGroup(InstrumentGroup instrumentGroup) {
        return audioSampleRepository.findByInstrumentGroupAndArchivedFalse(instrumentGroup).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByBpmRange(Integer minBpm, Integer maxBpm) {
        return audioSampleRepository.findByBpmBetweenAndArchivedFalse(minBpm, maxBpm).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByKey(MusicalKey key) {
        return audioSampleRepository.findByKeyAndArchivedFalse(key).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AudioSampleDTO> getStandaloneSamples(Pageable pageable) {
        return audioSampleRepository.findByArchivedFalse(pageable)
                .map(audioSampleMapper::toDTO);
    }

    @Override
    public List<AudioSampleDTO> getSamplesByPack(UUID packId) {
        return audioSampleRepository.findByPackIdAndArchivedFalse(packId).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AudioSampleDTO> searchSamples(AudioSampleSearchRequest request, Pageable pageable) {
        return audioSampleRepository.searchSamples(
                request.getGenre(),
                request.getSampleType(),
                request.getMinBpm(),
                request.getMaxBpm(),
                request.getKey(),
                request.getInstrumentGroup(),
                pageable
        ).map(audioSampleMapper::toDTO);
    }

    @Override
    public List<AudioSampleDTO> searchSamplesByName(String name) {
        return audioSampleRepository.findByNameContainingIgnoreCase(name).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> findSimilarSamples(UUID sampleId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        return audioSampleRepository.findSimilarSamples(
                        sample.getGenre(),
                        sample.getBpm(),
                        sampleId
                ).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countSamplesByAuthor(UUID authorId) {
        return audioSampleRepository.countByAuthorId(authorId);
    }

    @Override
    public long countSamplesByGenre(Genre genre) {
        return audioSampleRepository.countByGenre(genre);
    }

    @Override
    public Page<AudioSampleDTO> getPopularSamplesByGenre(Genre genre, Pageable pageable) {
        return audioSampleRepository.findPopularByGenre(genre, pageable)
                .map(audioSampleMapper::toDTO);
    }



    private AudioSample getAudioSampleEntityById(UUID sampleId) {
        return audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new AudioSampleNotFoundException(sampleId));
    }

    @Override
    @Transactional
    public AudioSample saveAudioSample(AudioSample sample) {
        return audioSampleRepository.save(sample);
    }

    @Override
    @Transactional
    public AudioSampleDTO updateSamplePrice(UUID sampleId, UUID authorId, Double price) {
        AudioSample sample = getAudioSampleEntityById(sampleId);

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to modify this sample");
        }

        sample.setPrice(price);
        AudioSample saved = saveAudioSample(sample);
        return audioSampleMapper.toDTO(saved);
    }


    @Override
    public int countSamplesByPack(UUID packId) {
        return audioSampleRepository.countByPackId(packId);
    }

    @Override
    public List<AudioSampleDTO> getStandaloneSamplesByAuthor(UUID authorId) {
        return audioSampleRepository.findByAuthorIdAndPackIsNull(authorId).stream()
                .map(audioSampleMapper::toDTO)
                .collect(Collectors.toList());
    }


    // ================ Helper Methods ================
    private void validateAudioFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("audio/mpeg") &&
                        !contentType.equals("audio/wav") &&
                        !contentType.equals("audio/wave"))) {
            throw new AudioFileValidationException("Only MP3 and WAV files are allowed");
        }

        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw  new AudioFileValidationException("File size must not exceed 50MB");
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void adminArchiveSample(UUID sampleId) {

        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found: " + sampleId));

        sample.setArchived(true);
        sample.setArchivedAt(OffsetDateTime.now());

        audioSampleRepository.save(sample);


        log.info("📁 ADMIN archived sample {}", sampleId);
    }

    @Override
    @Transactional
    public void archiveAllByAuthor(UUID targetUserId) {
        List<AudioSample> samplesToArchive = audioSampleRepository.findByAuthorIdAndArchivedFalse(targetUserId);

        for (AudioSample sample : samplesToArchive) {
            sample.setArchived(true);
            sample.setArchivedAt(OffsetDateTime.now());
            audioSampleRepository.save(sample);
        }

        log.info("📁 ADMIN archived all samples for user {}", targetUserId);
    }

    @Override
    @Transactional
    public void archiveSample(UUID sampleId, UUID authorId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new AudioSampleNotFoundException(sampleId));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to archive this sample");
        }

        try {
            sample.setArchived(true);
            sample.setArchivedAt(OffsetDateTime.now());

            audioSampleRepository.save(sample);

            log.info("✅ Sample with ID {} has been archived by its author {}", sampleId, authorId);

            long remainingSamples = audioSampleRepository.countByAuthorId(authorId);

            if (remainingSamples == 0) {
                userRolesService.removeRoleFromUser(authorId, UserRole.AUTHOR);
                log.info("User {} no longer has samples, AUTHOR role removed.", authorId);
            }

        } catch (Exception e) {
            log.error("Failed to archive audio sample", e);
            throw new FileProcessingException("Failed to archive audio sample: " + e.getMessage());
        }
    }

    @Override
    public void deleteSample(UUID id, UUID authorId) {
        audioSampleRepository.deleteById(id);
    }

}