package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.common.exception.FileProcessingException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
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
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
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
        return samplePackManagementService.uploadPack(authorId, request);
    }

    @Override
    @Transactional
    public SamplePackDTO updatePack(UUID packId, UUID authorId, UpdatePackRequest request) {
        log.info("=== UPDATE PACK STARTED ===");
        log.info("Pack ID: {}, Author ID: {}", packId, authorId);
        log.info("Request title: {}", request.getTitle());
        log.info("Request artist: {}", request.getArtist());
        log.info("Cover image provided: {}", request.getCoverImage() != null && !request.getCoverImage().isEmpty());
        log.info("Samples to add count: {}", request.getSamplesToAdd() != null ? request.getSamplesToAdd().size() : 0);
        log.info("Samples to remove count: {}", request.getSamplesToRemove() != null ? request.getSamplesToRemove().size() : 0);

        if (request.getSamplesToAdd() != null) {
            for (int i = 0; i < request.getSamplesToAdd().size(); i++) {
                NewSampleUploadForPack sample = request.getSamplesToAdd().get(i);
                log.info("Sample {}: name={}, file={}", i, sample.getName(),
                        sample.getFile() != null ? sample.getFile().getOriginalFilename() : "null");
            }
        }
        return samplePackManagementService.updatePack(packId, authorId, request);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 0 6 7 *")
    public void deleteArchivedPacks() {
        OffsetDateTime oneYearAgo = OffsetDateTime.now().minusYears(1); // The threshold for archiving

        List<SamplePack> archivedPacks = samplePackRepository.findByArchivedTrue();

        // Iterate over the archived packs and delete those older than one year
        archivedPacks.stream()
                .filter(pack -> pack.getArchivedAt().isBefore(oneYearAgo))
                .forEach(pack -> {
                    try {
                        samplePackManagementService.deletePack(pack.getId(), pack.getAuthorId());
                        log.info("Archived pack with ID {} and author {} has been deleted", pack.getId(), pack.getAuthorId());
                    } catch (Exception e) {
                        log.error("Failed to delete archived pack with ID {}", pack.getId(), e);
                    }
                });
    }

    @Override
    public SamplePackDTO getPackById(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found with id: " + packId));

        SamplePackDTO dto = samplePackMapper.toDTO(pack);
        return dto;
    }

    @Override
    public SamplePackDetailDTO getPackWithSamples(UUID packId) {
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
        return samplePackRepository.findByAuthorIdAndArchivedFalse(authorId).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SamplePackDTO> getPacksByArtist(String artist, Pageable pageable) {

        return samplePackRepository.findByArtistAndArchivedFalse(artist, pageable)
                .map(samplePackMapper::toDTO);
    }

    @Override
    public List<SamplePackDTO> getPacksByGenre(Genre genre) {

        return samplePackRepository.findByGenresContainingAndArchivedFalse(genre).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SamplePackDTO> getAllPacks(Pageable pageable) {
        return samplePackRepository.findByArchivedFalse(pageable)
                .map(samplePackMapper::toDTO);
    }

    @Override
    public Page<SamplePackDTO> searchPacks(SamplePackSearchRequest request, Pageable pageable) {

        Page<SamplePackDTO> page = samplePackRepository.searchPacks(
                request.getArtist(),
                request.getGenre(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                pageable
        ).map(samplePackMapper::toDTO);

        List<SamplePackDTO> filtered = page
                .getContent()
                .stream()
                .filter(pack -> !pack.isArchived())
                .toList();

        return new PageImpl<>(
                filtered,
                pageable,
                filtered.size()
        );
    }

    @Override
    public List<SamplePackDTO> searchPacksByTitle(String title) {
        return samplePackRepository.findByTitleContainingIgnoreCaseAndArchivedFalse(title).stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> findSimilarPacks(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        return samplePackRepository.findSimilarPacks(pack.getGenres(), packId).stream()
                .filter(sample -> !sample.isArchived())
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getTopRatedPacks() {
        return samplePackRepository.findTop10ByOrderByRatingDescAndArchivedFalse().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getMostDownloadedPacks() {
        return samplePackRepository.findTop10ByOrderByDownloadsDescAndArchivedFalse().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SamplePackDTO> getLatestPacks() {
        return samplePackRepository.findTop10ByOrderByReleaseDateDescAndArchivedFalse().stream()
                .map(samplePackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countPacksByAuthor(UUID authorId) {
        return samplePackRepository.countByAuthorId(authorId);
    }

    @Override
    @Transactional
    public void incrementDownloadCount(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        pack.setDownloads(pack.getDownloads() + 1);
        samplePackRepository.save(pack);
    }

    @Override
    public ProducerStatsDTO getProducerStats(UUID authorId) {
        long totalSamples = audioSampleService.countSamplesByAuthor(authorId);
        long totalPacks = samplePackRepository.countByAuthorId(authorId);

        Double totalRevenue = 0.0;
        Integer totalDownloads = 0;
        Double averageRating = 0.0;

        List<SamplePack> packs = samplePackRepository.findByAuthorIdAndArchivedFalse(authorId);
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

    @Override
    @Transactional
    public void archiveAllByAuthor(UUID targetUserId) {
        List<SamplePack> samplePacksToArchive = samplePackRepository.findByAuthorIdAndArchivedFalse(targetUserId);

        for (SamplePack pack : samplePacksToArchive) {
            pack.setArchived(true);
            pack.setArchivedAt(OffsetDateTime.now()); // Записваме времето на архивирането
            samplePackRepository.save(pack); // Записваме в базата данни
        }

        log.info("📁 Archived all sample packs for user {}", targetUserId);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void adminArchivePack(UUID packId) {

        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found: " + packId));

        pack.setArchived(true);
        pack.setArchivedAt(OffsetDateTime.now());

        samplePackRepository.save(pack);

        log.info("📦 ADMIN archived sample pack {}", packId);
    }

    @Override
    @Transactional
    public void archivePackByUser(UUID samplePackId, UUID authorId) {

        SamplePack samplePack = samplePackRepository.findById(samplePackId)
                .orElseThrow(() -> new NotFoundException("Sample pack not found with ID: " + samplePackId));

        if (!samplePack.getAuthorId().equals(authorId)) {
            throw new ForbiddenOperationException("Unauthorized to archive this sample pack");
        }

        try {

            samplePack.setArchived(true);
            samplePack.setArchivedAt(OffsetDateTime.now());

            samplePackRepository.save(samplePack);

            log.info("📁 Sample pack with ID {} has been archived by its author {}", samplePackId, authorId);
        } catch (Exception e) {
            log.error("Failed to archive sample pack", e);
            throw new FileProcessingException("Failed to archive sample pack: " + e.getMessage());
        }
    }

    @Override
    public Page<SamplePackDTO> filterPacks(SamplePackFilterRequest filterRequest, Pageable pageable) {
        log.debug("Filtering packs with request: {}", filterRequest);

        // Build pageable with sort
        Pageable sortedPageable = buildPageableWithSort(filterRequest.getSortBy(), pageable);

        // Call repository with all filter parameters
        Page<SamplePack> packsPage = samplePackRepository.advancedSearch(
                filterRequest.getArtist(),
                filterRequest.getTitle(),
                filterRequest.getGenres(),
                filterRequest.getMinPrice(),
                filterRequest.getMaxPrice(),
                filterRequest.getMinRating(),
                sortedPageable
        );

        return packsPage.map(samplePackMapper::toDTO);
    }

    @Override
    public PackFilterMetadata getFilterMetadata() {
        List<String> artists = samplePackRepository.findDistinctArtists();

        List<Genre> genres = samplePackRepository.findDistinctGenres();

        List<Double[]> priceRange = samplePackRepository.getPriceRange();
        Double minPrice = 0.0;
        Double maxPrice = 100.0;

        if (!priceRange.isEmpty() && priceRange.get(0) != null) {
            Double[] range = priceRange.get(0);
            if (range[0] != null) minPrice = range[0];
            if (range[1] != null) maxPrice = range[1];
        }
        Long totalPacks = samplePackRepository.count(); // Or implement custom count

        return PackFilterMetadata.builder()
                .availableArtists(artists)
                .availableGenres(genres)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .totalPacks(totalPacks)
                .build();
    }

    private Pageable buildPageableWithSort(String sortBy, Pageable pageable) {
        if (sortBy == null || sortBy.isBlank()) {
            return PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "releaseDate")
            );
        }

        Sort sort = switch (sortBy.toLowerCase()) {
            case "newest" -> Sort.by(Sort.Direction.DESC, "releaseDate");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "releaseDate");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "downloads" -> Sort.by(Sort.Direction.DESC, "downloads");
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            default -> Sort.by(Sort.Direction.DESC, "releaseDate");
        };

        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
    }

}