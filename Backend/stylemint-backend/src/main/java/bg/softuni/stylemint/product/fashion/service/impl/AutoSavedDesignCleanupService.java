package bg.softuni.stylemint.product.fashion.service.impl;

import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.external.claudinary.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoSavedDesignCleanupService {

    private final ClothDesignRepository designRepo;
    private final CloudinaryService cloudinaryService;

    /**
     * Delete auto-saved designs older than 30 days.
     * Runs every night at 03:00.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldAutoSavedDesigns() {

        OffsetDateTime threshold = OffsetDateTime.now().minusDays(30);

        List<ClothDesign> oldAutoSavedDesigns =
                designRepo.findByAutoSavedTrueAndCreatedAtBefore(threshold);

        if (oldAutoSavedDesigns.isEmpty()) {
            return;
        }

        log.info("🧹 Cleaning {} old auto-saved designs older than 30 days",
                oldAutoSavedDesigns.size());

        oldAutoSavedDesigns.forEach(design -> {
            try {
                // Remove custom decal (if exists)
                if (design.getCustomDecalPath() != null) {
                    cloudinaryService.deleteFile(design.getCustomDecalPath());
                }

                designRepo.delete(design);
                log.info("🗑️ Deleted auto-saved design: {}", design.getId());

            } catch (Exception e) {
                log.error("❌ Failed to delete auto-saved design {}: {}",
                        design.getId(), e.getMessage());
            }
        });
    }
}
