package bg.softuni.stylemint.product.common.service.impl;

import bg.softuni.dtos.enums.nft.NftType;
import bg.softuni.dtos.nft.UserNftsResponse;
import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.game.enums.RewardType;
import bg.softuni.stylemint.product.common.dto.DiscountInfo;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import bg.softuni.stylemint.product.common.service.EnhancedDiscountService;
import bg.softuni.stylemint.product.fashion.config.FashionPriceProperties;
import bg.softuni.stylemint.product.fashion.model.ClothDesign;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class UniversalDiscountService implements EnhancedDiscountService {

    private final OneTimeDiscountService oneTimeDiscountService;
    private final NftServiceFacade nftServiceFacade;
    private final BonusPointsService bonusPointsService;
    private final FashionPriceProperties fashionPriceProperties;

    // NFT mapping
    private static final Map<NftType, RewardType> NFT_TO_REWARD_MAP = Map.of(
            NftType.NFT_DISCOUNT_5, RewardType.NFT_DISCOUNT_5,
            NftType.NFT_DISCOUNT_7, RewardType.NFT_DISCOUNT_7
    );

    // ==================== UNIVERSAL PRICE CALCULATION ====================

    @Override
    public double calculateFinalPrice(BaseProduct product, UUID userId) {
        if (userId == null || product == null) {
            return product != null ? product.getPrice() : 0.0;
        }

        double basePrice = product.getPrice();

        // 1. Product-specific discount (bonus points for fashion, etc.)
        double productDiscount = getProductSpecificDiscount(userId, product);
        double priceAfterProduct = basePrice * (1 - productDiscount);

        // 2. NFT discount
        double nftDiscount = getNftDiscountPercentage(userId);
        double priceAfterNft = priceAfterProduct * (1 - nftDiscount);

        // 3. One-time discount
        double oneTimeDiscount = getBestDiscountPercentage(userId);
        double finalPrice = priceAfterNft * (1 - oneTimeDiscount);

        log.debug("Price calculation: Base={}, ProductDisc={}%, NftDisc={}%, OneTimeDisc={}%, Final={}",
                basePrice, productDiscount*100, nftDiscount*100, oneTimeDiscount*100, finalPrice);

        return finalPrice;
    }


    @Override
    public DiscountInfo getDiscountInfo(UUID userId, BaseProduct product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        double basePrice = product.getPrice();
        double productDiscount = getProductSpecificDiscount(userId, product);
        double nftDiscount = getNftDiscountPercentage(userId);
        double oneTimeDiscount = getBestDiscountPercentage(userId);

        return buildDiscountInfo(basePrice, productDiscount, nftDiscount, oneTimeDiscount);
    }

    // ==================== PRODUCT-SPECIFIC DISCOUNTS ====================

    @Override
    public double getProductSpecificDiscount(UUID userId, BaseProduct product) {
        if (userId == null || product == null) {
            return 0.0;
        }

        if (product instanceof ClothDesign) {
            // Fashion bonus points discount
            int totalPoints = bonusPointsService.getUserBonusPoints(userId);
            return fashionPriceProperties.getBonusDiscount(totalPoints);
        }

        // Other product types have no product-specific discounts
        return 0.0;
    }

    // ==================== NFT DISCOUNTS ====================

    @Override
    public double getNftDiscountPercentage(UUID userId) {
        RewardType highestNft = getHighestNftDiscountType(userId);

        if (highestNft == null) {
            return 0.0;
        }

        return switch (highestNft) {
            case NFT_DISCOUNT_7 -> 0.07;
            case NFT_DISCOUNT_5 -> 0.05;
            default -> 0.0;
        };
    }


    @Override
    public List<RewardType> getAvailableNftDiscounts(UUID userId) {
        try {
            UserNftsResponse nfts = nftServiceFacade.getUserNfts(userId);

            if (nfts == null || nfts.getNfts() == null) {
                return Collections.emptyList();
            }

            return nfts.getNfts().stream()
                    .map(UserNftsResponse.NftInfo::getNftType)
                    .filter(NFT_TO_REWARD_MAP::containsKey)
                    .map(NFT_TO_REWARD_MAP::get)
                    .distinct()
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("Failed to fetch NFT discounts: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public boolean hasNftDiscountType(UUID userId, RewardType nftDiscountType) {
        return getAvailableNftDiscounts(userId).contains(nftDiscountType);
    }

    @Override
    public RewardType getHighestNftDiscountType(UUID userId) {
        List<RewardType> nftDiscounts = getAvailableNftDiscounts(userId);

        if (nftDiscounts.contains(RewardType.NFT_DISCOUNT_7)) {
            return RewardType.NFT_DISCOUNT_7;
        }
        if (nftDiscounts.contains(RewardType.NFT_DISCOUNT_5)) {
            return RewardType.NFT_DISCOUNT_5;
        }

        return null;
    }

    // ==================== ONE-TIME DISCOUNTS (DELEGATED) ====================

    @Override
    public void saveDiscount(UUID userId, RewardType rewardType) {
        if (isNftDiscount(rewardType)) {
            log.debug("NFT discount {} managed externally by NFT service", rewardType);
        } else {
            oneTimeDiscountService.saveDiscount(userId, rewardType);
        }
    }

    @Override
    public double getBestDiscountPercentage(UUID userId) {
        return oneTimeDiscountService.getBestDiscountPercentage(userId);
    }

    @Override
    public RewardType useBestDiscount(UUID userId) {
        return oneTimeDiscountService.useBestDiscount(userId);
    }

    @Override
    public List<RewardType> getAvailableDiscounts(UUID userId) {
        List<RewardType> allDiscounts = new ArrayList<>();
        allDiscounts.addAll(getAvailableNftDiscounts(userId));
        allDiscounts.addAll(oneTimeDiscountService.getAvailableDiscounts(userId));
        return allDiscounts;
    }

    // ==================== HELPER METHODS ====================

    private DiscountInfo buildDiscountInfo(double basePrice, double productDiscount,
                                           double nftDiscount, double oneTimeDiscount) {
        double priceAfterProduct = basePrice * (1 - productDiscount);
        double priceAfterNft = priceAfterProduct * (1 - nftDiscount);
        double finalPrice = priceAfterNft * (1 - oneTimeDiscount);
        double totalDiscount = basePrice > 0 ? 1 - (finalPrice / basePrice) : 0.0;

        return DiscountInfo.builder()
                .basePrice(basePrice)
                .productSpecificDiscount(productDiscount)
                .nftDiscount(nftDiscount)
                .oneTimeDiscount(oneTimeDiscount)
                .finalPrice(finalPrice)
                .totalDiscountPercentage(totalDiscount)
                .build();
    }

    private boolean isNftDiscount(RewardType rewardType) {
        return rewardType == RewardType.NFT_DISCOUNT_5 ||
                rewardType == RewardType.NFT_DISCOUNT_7;
    }
}