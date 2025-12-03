package bg.softuni.stylemint.product.common.web;

import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.service.DiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@Slf4j
@RestController
@RequestMapping(BASE + "/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    /**
     * Get all available discount rewards for authenticated user
     */
    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RewardType>> getAvailable(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();

        log.info("➡️ Getting available discounts for user {}", userId);

        return ResponseEntity.ok(discountService.getAvailableDiscounts(userId));
    }
}
