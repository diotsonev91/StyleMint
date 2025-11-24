// src/api/price.api.ts
import API from "./config";

const PRICE_BASE = "/prices";

/**
 * Price API - handles all price-related API calls
 *
 * Endpoints:
 * - GET /api/prices/config - Complete price configuration
 * - GET /api/prices/base - Base prices only
 * - GET /api/prices/bonus-tiers - Bonus multiplier tiers
 * - GET /api/prices/discounts - Available discounts
 */
export const priceApi = {
    /**
     * Get complete price configuration
     * Returns base prices, custom decal premium, bonus tiers, and discounts
     */
    async getConfig() {
        return API.get(`${PRICE_BASE}/config`);
    },

    /**
     * Get base prices only (lightweight endpoint)
     * Returns: { "T_SHIRT_SPORT": 29.99, "HOODIE": 49.99, ... }
     */
    async getBasePrices() {
        return API.get(`${PRICE_BASE}/base`);
    },

    /**
     * Get bonus multiplier tiers
     * Returns array of bonus tiers with min points and multipliers
     */
    async getBonusTiers() {
        return API.get(`${PRICE_BASE}/bonus-tiers`);
    },

    /**
     * Get available discount types
     * Returns array of discounts (NFT and one-time)
     */
    async getDiscounts() {
        return API.get(`${PRICE_BASE}/discounts`);
    }
};

// ========================================
// TYPE DEFINITIONS
// ========================================

export type ClothType =
    | 'T_SHIRT_SPORT'
    | 'T_SHIRT_CLASSIC'
    | 'HOODIE'
    | 'CAP'
    | 'SHOE';

export interface BonusTier {
    minPoints: number;
    multiplier: number;
    description: string;
}

export interface DiscountInfo {
    type: string;
    percentage: number;
    description: string;
    permanent: boolean;
}

export interface PriceConfig {
    basePrices: Record<ClothType, number>;
    customDecalPremium: number;
    bonusTiers: BonusTier[];
    discounts: DiscountInfo[];
}

export interface PriceCalculation {
    basePrice: number;
    multiplier: number;
    decalPremium: number;
    subtotal: number;
    nftDiscount: number;
    oneTimeDiscount: number;
    finalPrice: number;
}

export interface UserDiscounts {
    hasNft5?: boolean;
    hasNft7?: boolean;
    hasDiscount20?: boolean;
    hasDiscount40?: boolean;
}