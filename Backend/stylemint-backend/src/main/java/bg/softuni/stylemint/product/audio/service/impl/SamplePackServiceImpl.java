package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SamplePackServiceImpl implements SamplePackService {

    private final SamplePackRepository samplePackRepository;
    private final AudioSampleRepository audioSampleRepository;
    // Inject your file storage service here
    // private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request) {
        // TODO: Upload cover image to storage
        // String coverImageUrl = fileStorageService.uploadImage(request.getCoverImage());

        // Create the pack
        SamplePack pack = SamplePack.builder()
                .title(request.getTitle())
                .authorId(authorId)
                .artist(request.getArtist())
                .coverImage("temp_cover_url") // Replace with actual uploaded URL
                .price(request.getPrice().doubleValue())
                .sampleCount(request.getSamples().size())
                .totalSize("0 MB") // Calculate from actual files
                .description(request.getDescription())
                .genres(request.getGenres())
                .tags(request.getTags())
                .rating(0.0)
                .downloads(0)
                .releaseDate(OffsetDateTime.now())
                .build();

        SamplePack savedPack = samplePackRepository.save(pack);

        // Upload and create samples
        List<AudioSample> samples = new ArrayList<>();
        for (PackSampleInfo sampleInfo : request.getSamples()) {
            // TODO: Upload sample file
            // String audioUrl = fileStorageService.uploadAudioFile(sampleInfo.getFile());

            AudioSample sample = AudioSample.builder()
                    .name(sampleInfo.getName())
                    .authorId(authorId)
                    .artist(request.getArtist())
                    .audioUrl("temp_audio_url") // Replace with actual uploaded URL
                    .duration(0) // Calculate from actual file
                    .bpm(sampleInfo.getBpm())
                    .key(sampleInfo.getMusicalKey())
                    .scale(sampleInfo.getMusicalScale())
                    .genre(request.getGenres().get(0)) // Use first genre from pack
                    .instrumentGroup(sampleInfo.getInstrumentGroup())
                    .sampleType(sampleInfo.getSampleType())
                    .price(0.0) // Samples in packs are not sold individually
                    .pack(savedPack)
                    .build();

            samples.add(audioSampleRepository.save(sample));
        }

        return mapToDTO(savedPack);
    }

    @Override
    public SamplePackDTO getPackById(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found with id: " + packId));
        return mapToDTO(pack);
    }

    @Override
    public SamplePackDetailDTO getPackWithSamples(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        List<AudioSample> samples = audioSampleRepository.findByPackId(packId);

        return SamplePackDetailDTO.builder()
                .pack(mapToDTO(pack))
                .samples(samples.stream()
                        .map(this::mapSampleToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional
    public SamplePackDTO updatePack(UUID packId, UUID authorId, UploadPackRequest request) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        // Authorization check
        if (!pack.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to update this pack");
        }

        // Update fields
        pack.setTitle(request.getTitle());
        pack.setArtist(request.getArtist());
        pack.setPrice(request.getPrice().doubleValue());
        pack.setDescription(request.getDescription());
        pack.setGenres(request.getGenres());
        pack.setTags(request.getTags());

        // If new cover image is uploaded
        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            // TODO: Delete old cover and upload new one
            // String newCoverUrl = fileStorageService.uploadImage(request.getCoverImage());
            // pack.setCoverImage(newCoverUrl);
        }

        SamplePack updated = samplePackRepository.save(pack);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deletePack(UUID packId, UUID authorId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        // Authorization check
        if (!pack.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to delete this pack");
        }

        // Delete all samples in the pack
        List<AudioSample> samples = audioSampleRepository.findByPackId(packId);
        for (AudioSample sample : samples) {
            // TODO: Delete audio files from storage
            // fileStorageService.deleteFile(sample.getAudioUrl());
            audioSampleRepository.delete(sample);
        }

        // TODO: Delete cover image from storage
        // fileStorageService.deleteFile(pack.getCoverImage());

        samplePackRepository.delete(pack);
    }

    @Override
    public List<SamplePackDTO> getPacksByAuthor(UUID authorId) {
        return samplePackRepository.findByAuthorId(authorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SamplePackDTO> getPacksByArtist(String artist, Pageable pageable) {
        return samplePackRepository.findByArtist(artist, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public List<SamplePackDTO> getPacksByGenre(Genre genre) {
        return samplePackRepository.findByGenresContaining(genre).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SamplePackDTO> getAllPacks(Pageable pageable) {
        return samplePackRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public Page<SamplePackDTO> searchPacks(SamplePackSearchRequest request, Pageable pageable) {
        return samplePackRepository.searchPacks(
                request.getArtist(),
                request.getGenre(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                pageable
        ).map(this::mapToDTO);
    }

    @Override
    public List<SamplePackDTO> searchPacksByTitle(String title) {
        return samplePackRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> findSimilarPacks(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        return samplePackRepository.findSimilarPacks(pack.getGenres(), packId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getTopRatedPacks() {
        return samplePackRepository.findTop10ByOrderByRatingDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getMostDownloadedPacks() {
        return samplePackRepository.findTop10ByOrderByDownloadsDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getLatestPacks() {
        return samplePackRepository.findTop10ByOrderByReleaseDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SamplePackDTO> getFeaturedPacks(Pageable pageable) {
        return samplePackRepository.findFeaturedPacks(pageable).stream()
                .map(this::mapToDTO)
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                ));
    }

    @Override
    public long countPacksByAuthor(UUID authorId) {
        return samplePackRepository.countByAuthorId(authorId);
    }

    @Override
    @Transactional
    public void incrementDownloadCount(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        pack.setDownloads(pack.getDownloads() + 1);
        samplePackRepository.save(pack);
    }

    @Override
    @Transactional
    public void updatePackRating(UUID packId, Double rating) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack not found"));

        // TODO: Implement proper rating calculation (average of all ratings)
        pack.setRating(rating);
        samplePackRepository.save(pack);
    }

    @Override
    public ProducerStatsDTO getProducerStats(UUID authorId) {
        long totalSamples = audioSampleRepository.countByAuthorId(authorId);
        long totalPacks = samplePackRepository.countByAuthorId(authorId);

        // TODO: Calculate actual revenue and downloads from orders/purchases
        Double totalRevenue = 0.0;
        Integer totalDownloads = 0;
        Double averageRating = 0.0;

        List<SamplePack> packs = samplePackRepository.findByAuthorId(authorId);
        if (!packs.isEmpty()) {
            averageRating = packs.stream()
                    .filter(p -> p.getRating() != null)
                    .mapToDouble(SamplePack::getRating)
                    .average()
                    .orElse(0.0);

            totalDownloads = packs.stream()
                    .filter(p -> p.getDownloads() != null)
                    .mapToInt(SamplePack::getDownloads)
                    .sum();
        }

        return ProducerStatsDTO.builder()
                .totalSamples(totalSamples)
                .totalPacks(totalPacks)
                .totalRevenue(totalRevenue)
                .averageRating(averageRating)
                .totalDownloads(totalDownloads)
                .build();
    }

    // ================ Helper Methods ================

    private SamplePackDTO mapToDTO(SamplePack pack) {
        return SamplePackDTO.builder()
                .id(pack.getId())
                .title(pack.getTitle())
                .authorId(pack.getAuthorId())
                .artist(pack.getArtist())
                .coverImage(pack.getCoverImage())
                .price(pack.getPrice())
                .sampleCount(pack.getSampleCount())
                .totalSize(pack.getTotalSize())
                .description(pack.getDescription())
                .genres(pack.getGenres())
                .tags(pack.getTags())
                .rating(pack.getRating())
                .downloads(pack.getDownloads())
                .releaseDate(pack.getReleaseDate())
                .createdAt(pack.getCreatedAt())
                .updatedAt(pack.getUpdatedAt())
                .build();
    }

    private AudioSampleDTO mapSampleToDTO(AudioSample sample) {
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