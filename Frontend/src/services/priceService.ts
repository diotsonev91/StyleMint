// src/services/priceService.ts
import {
    priceApi,
    PriceConfig,
    ClothType,
    PriceCalculation,
    UserDiscounts,
    BonusTier,
    DiscountInfo
} from '../api/price.api';

/**
 * Price Service - handles price calculation and configuration logic
 *
 * Responsibilities:
 * - Fetch price configuration from backend
 * - Calculate final prices with discounts
 * - Cache price configuration
 * - Validate price data
 */
export const priceService = {
    // Cache for price configuration
    _configCache: null as PriceConfig | null,
    _cacheTimestamp: 0,
    _cacheDuration: 5 * 60 * 1000, // 5 minutes

    /**
     * Get complete price configuration (with caching)
     */
    async getConfig(forceRefresh = false): Promise<PriceConfig> {
        try {
            // Check cache
            if (!forceRefresh && priceService._configCache &&
                Date.now() - priceService._cacheTimestamp < priceService._cacheDuration) {
                return priceService._configCache;
            }

            // Fetch from API
            const response = await priceApi.getConfig();
            const config = response.data;

            // Update cache
            priceService._configCache = config;
            priceService._cacheTimestamp = Date.now();

            return config;
        } catch (error: any) {
            console.error('Failed to fetch price config:', error);

            // Return cached data if available, otherwise throw
            if (priceService._configCache) {
                console.warn('Using cached price config due to fetch failure');
                return priceService._configCache;
            }

            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to load price configuration'
            );
        }
    },

    /**
     * Get base prices only (lightweight)
     */
    async getBasePrices(): Promise<Record<ClothType, number>> {
        try {
            const response = await priceApi.getBasePrices();
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch base prices:', error);

            // Fallback to cached config if available
            if (priceService._configCache) {
                return priceService._configCache.basePrices;
            }

            throw new Error('Failed to load base prices');
        }
    },

    /**
     * Get bonus multiplier tiers
     */
    async getBonusTiers(): Promise<BonusTier[]> {
        try {
            const response = await priceApi.getBonusTiers();
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch bonus tiers:', error);

            // Fallback to cached config
            if (priceService._configCache) {
                return priceService._configCache.bonusTiers;
            }

            throw new Error('Failed to load bonus tiers');
        }
    },

    /**
     * Get available discounts
     */
    async getDiscounts(): Promise<DiscountInfo[]> {
        try {
            const response = await priceApi.getDiscounts();
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch discounts:', error);

            // Fallback to cached config
            if (priceService._configCache) {
                return priceService._configCache.discounts;
            }

            throw new Error('Failed to load discounts');
        }
    },

    /**
     * Calculate final price with all modifiers
     *
     * @param clothType - Type of clothing
     * @param bonusPoints - Designer's bonus points
     * @param hasCustomDecal - Whether design has custom decal
     * @param userDiscounts - User's active discounts
     * @param config - Price configuration (optional, will fetch if not provided)
     * @returns Complete price calculation breakdown
     */
    async calculatePrice(
        clothType: ClothType,
        bonusPoints: number,
        hasCustomDecal: boolean,
        userDiscounts?: UserDiscounts,
        config?: PriceConfig
    ): Promise<PriceCalculation> {
        try {
            // Get config if not provided
            const priceConfig = config || await priceService.getConfig();

            // 1. Get base price
            const basePrice = priceConfig.basePrices[clothType];
            if (!basePrice) {
                throw new Error(`No base price found for ${clothType}`);
            }

            // 2. Calculate bonus multiplier
            const multiplier = priceService._getMultiplierForPoints(
                bonusPoints,
                priceConfig.bonusTiers
            );

            // 3. Add custom decal premium
            const decalPremium = hasCustomDecal ? priceConfig.customDecalPremium : 0;

            // 4. Calculate subtotal
            const subtotal = (basePrice * multiplier) + decalPremium;

            // 5. Apply NFT discount (best one only)
            const nftDiscountPercent = priceService._getBestNftDiscount(userDiscounts);
            const priceAfterNft = subtotal * (1 - nftDiscountPercent);
            const nftDiscount = subtotal - priceAfterNft;

            // 6. Apply one-time discount (best one only)
            const oneTimeDiscountPercent = priceService._getBestOneTimeDiscount(userDiscounts);
            const finalPrice = priceAfterNft * (1 - oneTimeDiscountPercent);
            const oneTimeDiscount = priceAfterNft - finalPrice;

            return {
                basePrice,
                multiplier,
                decalPremium,
                subtotal,
                nftDiscount,
                oneTimeDiscount,
                finalPrice: Math.max(0, finalPrice) // Ensure non-negative
            };
        } catch (error: any) {
            console.error('Price calculation error:', error);
            throw new Error('Failed to calculate price');
        }
    },

    /**
     * Calculate prices for multiple items
     */
    async calculateCartTotal(
        items: Array<{
            clothType: ClothType;
            bonusPoints: number;
            hasCustomDecal: boolean;
            quantity: number;
        }>,
        userDiscounts?: UserDiscounts
    ): Promise<{ items: PriceCalculation[]; total: number }> {
        try {
            const config = await priceService.getConfig();

            const calculations = await Promise.all(
                items.map(item =>
                    priceService.calculatePrice(
                        item.clothType,
                        item.bonusPoints,
                        item.hasCustomDecal,
                        userDiscounts,
                        config
                    )
                )
            );

            const total = calculations.reduce((sum, calc, index) => {
                return sum + (calc.finalPrice * items[index].quantity);
            }, 0);

            return {
                items: calculations,
                total
            };
        } catch (error: any) {
            console.error('Cart total calculation error:', error);
            throw new Error('Failed to calculate cart total');
        }
    },

    /**
     * Get multiplier for bonus points
     */
    _getMultiplierForPoints(bonusPoints: number, tiers: BonusTier[]): number {
        // Sort tiers by min points descending
        const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);

        // Find first tier where user meets min points
        const tier = sortedTiers.find(t => bonusPoints >= t.minPoints);

        return tier?.multiplier ?? 1.0;
    },

    /**
     * Get best NFT discount percentage
     */
    _getBestNftDiscount(userDiscounts?: UserDiscounts): number {
        if (!userDiscounts) return 0;

        // NFT_DISCOUNT_7 is better than NFT_DISCOUNT_5
        if (userDiscounts.hasNft7) return 0.07;
        if (userDiscounts.hasNft5) return 0.05;

        return 0;
    },

    /**
     * Get best one-time discount percentage
     */
    _getBestOneTimeDiscount(userDiscounts?: UserDiscounts): number {
        if (!userDiscounts) return 0;

        // DISCOUNT_40 is better than DISCOUNT_20
        if (userDiscounts.hasDiscount40) return 0.40;
        if (userDiscounts.hasDiscount20) return 0.20;

        return 0;
    },

    /**
     * Format price for display
     */
    formatPrice(price: number, currency = '€'): string {
        return `${currency}${price.toFixed(2)}`;
    },

    /**
     * Get discount percentage display text
     */
    getDiscountText(calculation: PriceCalculation): string | null {
        const totalDiscount = calculation.nftDiscount + calculation.oneTimeDiscount;

        if (totalDiscount === 0) return null;

        const percentageOff = (totalDiscount / calculation.subtotal) * 100;
        return `-${percentageOff.toFixed(0)}%`;
    },

    /**
     * Clear price configuration cache
     */
    clearCache(): void {
        priceService._configCache = null;
        priceService._cacheTimestamp = 0;
    },

    /**
     * Validate cloth type
     */
    isValidClothType(type: string): type is ClothType {
        const validTypes: ClothType[] = [
            'T_SHIRT_SPORT',
            'T_SHIRT_CLASSIC',
            'HOODIE',
            'CAP',
            'SHOE'
        ];
        return validTypes.includes(type as ClothType);
    }
};