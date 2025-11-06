package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.FileProcessingException;
import bg.softuni.stylemint.common.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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


    @Override
    @Transactional
    public AudioSampleDTO uploadSample(UUID authorId, UploadSampleRequest request) {
        MultipartFile file = request.getFile();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        validateAudioFile(file);

        try {
            // 1. Upload to Cloudinary - връща URL + metadata наведнъж!
            Map<String, Object> uploadResult = cloudinaryService.uploadAudio(file, authorId);

            String audioUrl = (String) uploadResult.get("url");
            Double durationInSeconds = (Double) uploadResult.get("duration");
            Integer duration = durationInSeconds != null ? durationInSeconds.intValue() : null;

            log.info("Uploaded audio: URL={}, Duration={} seconds", audioUrl, duration);

            // 2. Build entity and persist
            AudioSample sample = AudioSample.builder()
                    .name(request.getName())
                    .authorId(authorId)
                    .artist(request.getArtist())
                    .audioUrl(audioUrl)
                    .duration(duration)  // Now we have duration from upload!
                    .bpm(request.getBpm())
                    .key(request.getMusicalKey())
                    .scale(request.getMusicalScale())
                    .genre(request.getGenre())
                    .instrumentGroup(request.getInstrumentGroup())
                    .sampleType(request.getSampleType())
                    .price(request.getPrice().doubleValue())
                    .build();

            AudioSample saved = audioSampleRepository.save(sample);

            return mapToDTO(saved);
        } catch (Exception e) {
            log.error("Failed to upload audio sample", e);
            throw new FileProcessingException("Failed to upload audio sample: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AudioSampleDTO updateSample(UUID sampleId, UUID authorId, UploadSampleRequest request) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to update this sample");
        }

        try {
            // Update metadata
            sample.setName(request.getName());
            sample.setArtist(request.getArtist());
            sample.setBpm(request.getBpm());
            sample.setKey(request.getMusicalKey());
            sample.setScale(request.getMusicalScale());
            sample.setGenre(request.getGenre());
            sample.setInstrumentGroup(request.getInstrumentGroup());
            sample.setSampleType(request.getSampleType());
            sample.setPrice(request.getPrice().doubleValue());

            // If new file is uploaded
            if (request.getFile() != null && !request.getFile().isEmpty()) {
                validateAudioFile(request.getFile());

                String oldUrl = sample.getAudioUrl();

                // Upload new file
                Map<String, Object> uploadResult = cloudinaryService.uploadAudio(request.getFile(), authorId);
                String newAudioUrl = (String) uploadResult.get("url");
                Double durationInSeconds = (Double) uploadResult.get("duration");
                Integer newDuration = durationInSeconds != null ? durationInSeconds.intValue() : null;

                sample.setAudioUrl(newAudioUrl);
                sample.setDuration(newDuration);

                // Delete old file after successful upload
                if (oldUrl != null) {
                    cloudinaryService.deleteFile(oldUrl);
                }
            }

            AudioSample updated = audioSampleRepository.save(sample);
            return mapToDTO(updated);
        } catch (Exception e) {
            log.error("Failed to update audio sample", e);
            throw new FileProcessingException("Failed to update audio sample: " + e.getMessage());
        }
    }

    @Override
    public AudioSampleDTO getSampleById(UUID sampleId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found with id: " + sampleId));
        return mapToDTO(sample);
    }



    @Override
    @Transactional
    public void deleteSample(UUID sampleId, UUID authorId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new NotFoundException("Sample not found"));

        // Authorization check
        if (!sample.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to delete this sample");
        }

        try {
            // Delete from Cloudinary
            cloudinaryService.deleteFile(sample.getAudioUrl());

            // Delete from database
            audioSampleRepository.delete(sample);
        } catch (Exception e) {
            throw new FileProcessingException("Failed to delete audio sample: " + e.getMessage());
        }
    }

    @Override
    public List<AudioSampleDTO> getSamplesByAuthor(UUID authorId) {
        return audioSampleRepository.findByAuthorId(authorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AudioSampleDTO> getSamplesByGenre(Genre genre, Pageable pageable) {
        return audioSampleRepository.findByGenre(genre, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public List<AudioSampleDTO> getSamplesByType(SampleType sampleType) {
        return audioSampleRepository.findBySampleType(sampleType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByInstrumentGroup(InstrumentGroup instrumentGroup) {
        return audioSampleRepository.findByInstrumentGroup(instrumentGroup).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByBpmRange(Integer minBpm, Integer maxBpm) {
        return audioSampleRepository.findByBpmBetween(minBpm, maxBpm).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioSampleDTO> getSamplesByKey(MusicalKey key) {
        return audioSampleRepository.findByKey(key).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AudioSampleDTO> getStandaloneSamples(Pageable pageable) {
        return audioSampleRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public List<AudioSampleDTO> getSamplesByPack(UUID packId) {
        return audioSampleRepository.findByPackId(packId).stream()
                .map(this::mapToDTO)
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
        ).map(this::mapToDTO);
    }

    @Override
    public List<AudioSampleDTO> searchSamplesByName(String name) {
        return audioSampleRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToDTO)
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
                .map(this::mapToDTO)
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
                .map(this::mapToDTO);
    }

    // ================ Helper Methods ================

    private void validateAudioFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("audio/mpeg") &&
                        !contentType.equals("audio/wav") &&
                        !contentType.equals("audio/wave"))) {
            throw new IllegalArgumentException("Only MP3 and WAV files are allowed");
        }

        // Check file size (e.g., max 50MB)
        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size must not exceed 50MB");
        }
    }

    private AudioSampleDTO mapToDTO(AudioSample sample) {
        return AudioSampleDTO.builder()
                .id(sample.getId())
                .name(sample.getName())
                .authorId(sample.getAuthorId())
                .artist(sample.getArtist())
                .audioUrl(sample.getAudioUrl())
                .duration(sample.getDuration())
                .bpm(sample.getBpm())
                .key(sample.getKey())
                .scale(sample.getScale())
                .genre(sample.getGenre())
                .instrumentGroup(sample.getInstrumentGroup())
                .sampleType(sample.getSampleType())
                .price(sample.getPrice())
                .packId(sample.getPack() != null ? sample.getPack().getId() : null)
                .packTitle(sample.getPack() != null ? sample.getPack().getTitle() : null)
                .createdAt(sample.getCreatedAt())
                .updatedAt(sample.getUpdatedAt())
                .build();
    }
}