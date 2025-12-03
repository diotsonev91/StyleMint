package bg.softuni.stylemint.product.common.web;

import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.dto.CartDiscountBreakdownDTO;
import bg.softuni.stylemint.product.common.dto.DiscountInfo;
import bg.softuni.stylemint.product.common.service.impl.UniversalPriceCalculator;
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

    private final UniversalPriceCalculator priceCalculator;

    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RewardType>> getAvailable(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        log.info("Getting available discounts for user {}", userId);

        List<RewardType> discounts = priceCalculator.getAvailableDiscounts(userId);
        return ResponseEntity.ok(discounts);
    }

    @PostMapping("/breakdown")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDiscountBreakdownDTO> getCartDiscountBreakdown(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestBody List<OrderItemRequestDTO> cartItems) {

        UUID userId = userDetails.getUserId();
        log.info("Getting discount breakdown for {} items for user {}", cartItems.size(), userId);

        CartDiscountBreakdownDTO breakdown = priceCalculator.getCartDiscountBreakdown(userId, cartItems);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/product/{productId}/type/{productType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiscountInfo> getProductDiscountInfo(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @PathVariable UUID productId,
            @PathVariable String productType) {

        UUID userId = userDetails.getUserId();
        log.info("Getting discount info for {} {}", productType, productId);

        DiscountInfo discountInfo = priceCalculator.getProductDiscountInfo(userId, productType, productId);
        return ResponseEntity.ok(discountInfo);
    }

    @GetMapping("/nft/percentage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Double> getNftDiscountPercentage(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        double percentage = priceCalculator.getNftDiscountPercentage(userId);
        return ResponseEntity.ok(percentage);
    }

    @GetMapping("/nft/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RewardType>> getAvailableNftDiscounts(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        List<RewardType> nftDiscounts = priceCalculator.getAvailableNftDiscounts(userId);
        return ResponseEntity.ok(nftDiscounts);
    }

    @GetMapping("/has-discounts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> hasAvailableDiscounts(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID userId = userDetails.getUserId();
        boolean hasDiscounts = priceCalculator.hasAvailableDiscounts(userId);
        return ResponseEntity.ok(hasDiscounts);
    }
}