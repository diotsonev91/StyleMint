package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.external.facade.nft.NftServiceFacade;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.common.service.DiscountService;
import bg.softuni.stylemint.product.common.service.impl.BasePriceCalculatorService;
import org.springframework.stereotype.Service;

/**
 * Sample Pack Price Calculator with discount support
 *
 * For SamplePack:
 * - Price is set by user (author) in database
 * - We only apply discounts on top of user-set price
 * - No additional modifiers
 *
 * Discounts applied:
 * - NFT discounts (5% or 7%, permanent)
 * - One-time discounts (20% or 40%, consumed after use)
 */
@Service("samplePackPriceCalculatorService")
public class SamplePackPriceCalculatorServiceImpl extends BasePriceCalculatorService<SamplePack> {

    public SamplePackPriceCalculatorServiceImpl(
            NftServiceFacade nftServiceFacade,
            DiscountService discountService) {
        super(nftServiceFacade, discountService);
    }

    /**
     * For SamplePack, base price is simply the price set by author in database
     * No additional calculations needed
     *
     * @param product SamplePack
     * @return User-set price from database
     */
    @Override
    protected double calculateBasePrice(SamplePack product) {
        // Price is set by user in database
        return product.getPrice() != null ? product.getPrice() : 0.0;
    }
}