package bg.softuni.stylemint.product.fashion.web;

import bg.softuni.stylemint.product.fashion.service.ClothLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

}
