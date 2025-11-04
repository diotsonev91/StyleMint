package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AudioSampleServiceImpl implements AudioSampleService {

    private final AudioSampleRepository audioSampleRepository;
    // Inject your file storage service here
    // private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public AudioSampleDTO uploadSample(UUID authorId, UploadSampleRequest request) {
        // TODO: Upload file to storage and get URL
        // String audioUrl = fileStorageService.uploadAudioFile(request.getFile());

        // TODO: Get audio duration from file
        // Integer duration = audioFileProcessor.getDuration(request.getFile());

        AudioSample sample = AudioSample.builder()
                .name(request.getName())
                .authorId(authorId)
                .artist(request.getArtist())
                .audioUrl("temp_url") // Replace with actual uploaded URL
                .duration(0) // Replace with actual duration
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
    }

    @Override
    public AudioSampleDTO getSampleById(UUID sampleId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new RuntimeException("Sample not found with id: " + sampleId));
        return mapToDTO(sample);
    }

    @Override
    @Transactional
    public AudioSampleDTO updateSample(UUID sampleId, UUID authorId, UploadSampleRequest request) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new RuntimeException("Sample not found"));

        // Authorization check
        if (!sample.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to update this sample");
        }

        // Update fields
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
            // TODO: Delete old file and upload new one
            // String newAudioUrl = fileStorageService.uploadAudioFile(request.getFile());
            // sample.setAudioUrl(newAudioUrl);
        }

        AudioSample updated = audioSampleRepository.save(sample);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSample(UUID sampleId, UUID authorId) {
        AudioSample sample = audioSampleRepository.findById(sampleId)
                .orElseThrow(() -> new RuntimeException("Sample not found"));

        // Authorization check
        if (!sample.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to delete this sample");
        }

        // TODO: Delete file from storage
        // fileStorageService.deleteFile(sample.getAudioUrl());

        audioSampleRepository.delete(sample);
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
                .orElseThrow(() -> new RuntimeException("Sample not found"));

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