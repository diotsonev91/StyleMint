package bg.softuni.stylemint.product.audio.web;

import bg.softuni.stylemint.product.audio.service.SampleLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequiredArgsConstructor
@RequestMapping(BASE + "/audio/samples")
public class SampleLikeController {

    private final SampleLikeService sampleLikeService;

    /**
     * Toggle like/unlike for a sample.
     * POST is the correct HTTP verb for toggle operations.
     */
    @PostMapping("/{sampleId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable UUID sampleId) {
        sampleLikeService.toggleLike(sampleId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("likesCount", sampleLikeService.getLikesCount(sampleId));
        body.put("isLiked", sampleLikeService.isLikedByUser(sampleId));

        return ResponseEntity.ok(body);
    }

    /**
     * Get like status for a sample (useful for initial page load)
     */
    @GetMapping("/{sampleId}/like-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getLikeStatus(@PathVariable UUID sampleId) {
        Map<String, Object> body = new HashMap<>();
        body.put("isLiked", sampleLikeService.isLikedByUser(sampleId));
        body.put("likesCount", sampleLikeService.getLikesCount(sampleId));

        return ResponseEntity.ok(body);
    }
}
