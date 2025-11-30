package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.common.dto.ApiResponse;
import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequiredArgsConstructor
@RequestMapping(BASE + "/designs")
public class ClothDesignLikeController {

    private final ClothLikeService clothLikeService;

    /**
     * Toggle like/unlike for a design.
     * POST is the correct HTTP verb for toggle operations.
     */
    @PostMapping("/{designId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable UUID designId) {
        clothLikeService.toggleLike(designId);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);

        return ResponseEntity.ok(body);
    }

    @GetMapping("/likes-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getLikesCountForDesigns(
            @RequestParam List<UUID> designIds) {

        Map<UUID, Long> likesCount = clothLikeService.getLikesCountForDesigns(designIds);

        // Convert UUID keys to String for JSON serialization
        Map<String, Long> result = likesCount.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().toString(),
                        Map.Entry::getValue
                ));

        return ResponseEntity.ok(ApiResponse.success(result));
    }

}
