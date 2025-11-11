package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.*;
import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackManagementService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.service.utils.SamplePackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SamplePackServiceImpl implements SamplePackService {

    private final SamplePackRepository samplePackRepository;
    private final SamplePackManagementService samplePackManagementService;
    private final AudioSampleService audioSampleService;
    private final SamplePackMapper samplePackMapper;


    @Override
    @Transactional
    public SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request) {
        // POST request - no transformation needed

        return samplePackManagementService.uploadPack(authorId, request);
    }

    @Override
    @Transactional
    public SamplePackDTO updatePack(UUID packId, UUID authorId, UpdatePackRequest request) {
        // PUT request - no transformation needed
        log.info("=== UPDATE PACK STARTED ===");
        log.info("Pack ID: {}, Author ID: {}", packId, authorId);
        log.info("Request title: {}", request.getTitle());
        log.info("Request artist: {}", request.getArtist());
        log.info("Cover image provided: {}", request.getCoverImage() != null && !request.getCoverImage().isEmpty());
        log.info("Samples to add count: {}", request.getSamplesToAdd() != null ? request.getSamplesToAdd().size() : 0);
        log.info("Samples to remove count: {}", request.getSamplesToRemove() != null ? request.getSamplesToRemove().size() : 0);

        if (request.getSamplesToAdd() != null) {
            for (int i = 0; i < request.getSamplesToAdd().size(); i++) {
                PackSampleInfo sample = request.getSamplesToAdd().get(i);
                log.info("Sample {}: name={}, file={}", i, sample.getName(),
                        sample.getFile() != null ? sample.getFile().getOriginalFilename() : "null");
            }
        }
        return samplePackManagementService.updatePack(packId, authorId, request);
    }

    @Override
    @Transactional
    public void deletePack(UUID packId, UUID authorId) {
        // DELETE request - no transformation needed
        samplePackManagementService.deletePack(packId, authorId);
    }

    @Override
    public SamplePackDTO getPackById(UUID packId) {
        // GET request - transform image URL
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found with id: " + packId));

        SamplePackDTO dto = samplePackMapper.toDTO(pack);
        return dto;
    }

    @Override
    public SamplePackDetailDTO getPackWithSamples(UUID packId) {
        // GET request - transform image URL
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        List<AudioSampleDTO> samples = audioSampleService.getSamplesByPack(packId);

        SamplePackDTO packDTO = samplePackMapper.toDTO(pack);

        return SamplePackDetailDTO.builder()
                .pack(packDTO)
                .samples(samples)
                .build();
    }

    @Override
    public List<SamplePackDTO> getPacksByAuthor(UUID authorId) {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findByAuthorId(authorId).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public Page<SamplePackDTO> getPacksByArtist(String artist, Pageable pageable) {
        // GET request - transform image URLs
        Page<SamplePackDTO> page = samplePackRepository.findByArtist(artist, pageable)
                .map(samplePackMapper::toDTO);
        return page;
    }

    @Override
    public List<SamplePackDTO> getPacksByGenre(Genre genre) {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findByGenresContaining(genre).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public Page<SamplePackDTO> getAllPacks(Pageable pageable) {
        // GET request - transform image URLs
        Page<SamplePackDTO> page = samplePackRepository.findAll(pageable)
                .map(samplePackMapper::toDTO);
        return page;
    }

    @Override
    public Page<SamplePackDTO> searchPacks(SamplePackSearchRequest request, Pageable pageable) {
        // GET request - transform image URLs
        Page<SamplePackDTO> page = samplePackRepository.searchPacks(
                request.getArtist(),
                request.getGenre(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                pageable
        ).map(samplePackMapper::toDTO);
        return page;
    }

    @Override
    public List<SamplePackDTO> searchPacksByTitle(String title) {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public List<SamplePackDTO> findSimilarPacks(UUID packId) {
        // GET request - transform image URLs
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        List<SamplePackDTO> dtos = samplePackRepository.findSimilarPacks(pack.getGenres(), packId).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public List<SamplePackDTO> getTopRatedPacks() {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findTop10ByOrderByRatingDesc().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public List<SamplePackDTO> getMostDownloadedPacks() {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findTop10ByOrderByDownloadsDesc().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public List<SamplePackDTO> getLatestPacks() {
        // GET request - transform image URLs
        List<SamplePackDTO> dtos = samplePackRepository.findTop10ByOrderByReleaseDateDesc().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
        return dtos;
    }

    @Override
    public Page<SamplePackDTO> getFeaturedPacks(Pageable pageable) {
        // GET request - transform image URLs
        Page<SamplePackDTO> page = samplePackRepository.findFeaturedPacks(pageable).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> new PageImpl<>(list, pageable, list.size())
                ));
        return page;
    }

    @Override
    public long countPacksByAuthor(UUID authorId) {
        // GET request but returns long - no transformation needed
        return samplePackRepository.countByAuthorId(authorId);
    }

    @Override
    @Transactional
    public void incrementDownloadCount(UUID packId) {
        // PATCH-like operation - no transformation needed
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        pack.setDownloads(pack.getDownloads() + 1);
        samplePackRepository.save(pack);
    }

    @Override
    @Transactional
    public void updatePackRating(UUID packId, Double rating) {
        // PATCH-like operation - no transformation needed
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        pack.setRating(rating);
        samplePackRepository.save(pack);
    }

    @Override
    public ProducerStatsDTO getProducerStats(UUID authorId) {
        // GET request but returns stats DTO - no image transformation needed
        long totalSamples = audioSampleService.countSamplesByAuthor(authorId);
        long totalPacks = samplePackRepository.countByAuthorId(authorId);

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

    @Override
    public boolean validatePackOwnership(UUID packId, UUID authorId) {
        return samplePackRepository.existsByIdAndAuthorId(packId, authorId);
    }



}