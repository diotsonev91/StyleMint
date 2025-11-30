package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.product.audio.model.PackRating;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.repository.PackRatingRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.SamplePackRatingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SamplePackRatingServiceImpl implements SamplePackRatingService {

    private final PackRatingRepository packRatingRepository;
    private final SamplePackRepository samplePackRepository;


    @Override
    @Transactional
    public void updateUserPackRate(UUID packId, UUID userId, Double rating) {
        validateRate(rating);

        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        // Проверка дали потребителят е собственик на пакета
        if (pack.getAuthorId().equals(userId)) {
            throw new ForbiddenOperationException("You cannot rate your own pack");
        }

        // Проверяваме дали потребителят вече е оценил пакета
        Optional<PackRating> existingRating = packRatingRepository.findBySamplePackAndUserId(pack, userId);

        PackRating packRating;
        if (existingRating.isPresent()) {
            // Ако има вече оценка - я ъпдейтваме
            packRating = existingRating.get();
            packRating.setRating(rating);
        } else {
            // Ако няма - създаваме нова
            packRating = new PackRating();
            packRating.setSamplePack(pack);
            packRating.setRating(rating);
            packRating.setUserId(userId);
        }

        packRatingRepository.save(packRating);
        updatePackAverageRating(pack);
    }

    @Override
    public Double getUserPackRate(UUID packId) {
        SamplePack pack = samplePackRepository.findById(packId)
                .orElseThrow(() -> new NotFoundException("Pack not found"));

        UUID currentUserId = SecurityUtil.getCurrentUserId();

        Optional<PackRating> userRating = packRatingRepository
                .findBySamplePackAndUserId(pack, currentUserId);

        if (userRating.isPresent()) {
            return userRating.get().getRating();
        }
        return null;
    }

    private void updatePackAverageRating(SamplePack pack) {
        double averageRating = packRatingRepository.findBySamplePack(pack).stream()
                .mapToDouble(PackRating::getRating)
                .average()
                .orElse(0.0);

        double roundedRating = Math.round(averageRating * 10.0) / 10.0;

        pack.setRating(roundedRating);
        samplePackRepository.save(pack);
    }

    @Override
    public void validateRate(Double rating) {
        if (rating < 1.0 || rating > 5.0) {
            throw new ForbiddenOperationException("Rating must be between 1.0 and 5.0");
        }
    }
}