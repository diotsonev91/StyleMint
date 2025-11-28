package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/designs")
public class ClothDesignLikeController {

    private final ClothLikeService clothLikeService;

    /**
     * Toggle like/unlike for a design.
     * POST is the correct HTTP verb for toggle operations.
     */
    @PostMapping("/{designId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable UUID designId) {
        clothLikeService.toggleLike(designId);
        return ResponseEntity.noContent().build();
    }
}
