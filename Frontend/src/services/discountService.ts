// discountService.ts

import type { CartDiscountBreakdown, DiscountInfo } from '../types/discountTypes';
import API from "../api/config";
import {CartItemState} from "../state";


/**
 * Service for fetching discount breakdowns
 */
export const discountService = {
    /**
     * Get discount breakdown for entire cart
     * Shows price at each discount stage for all items
     */
    async getCartBreakdown(cartItems: CartItemState[]): Promise<CartDiscountBreakdown> {
        // Convert cart items to OrderItemRequestDTO format
        const orderItems = cartItems.map(item => ({
            productId: item.id,
            productType: item.type.toUpperCase(),  // ← FIX: Convert to uppercase
            quantity: item.quantity || 1
        }));

        const response = await API.post<CartDiscountBreakdown>(
            '/discounts/breakdown',
            orderItems
        );

        return response.data;
    },

    /**
     * Get discount info for a single product
     */
    async getProductDiscountInfo(
        productId: string,
        productType: 'CLOTHES' | 'SAMPLE' | 'PACK'
    ): Promise<DiscountInfo> {
        const response = await API.get<DiscountInfo>(
            `/discounts/product/${productId}/type/${productType.toUpperCase()}`  // ← FIX
        );

        return response.data;
    },

    /**
     * Format price with currency
     */
    formatPrice(price: number): string {
        return `€${price.toFixed(2)}`;
    },

    /**
     * Format percentage
     */
    formatPercent(percent: number): string {
        return `${(percent * 100).toFixed(1)}%`;
    },

    /**
     * Get discount stage label
     */
    getDiscountStageLabel(stage: 'base' | 'product' | 'nft' | 'onetime'): string {
        const labels = {
            base: 'Original Price',
            product: 'After Bonus Points',
            nft: 'After NFT Discount',
            onetime: 'Final Price'
        };
        return labels[stage];
    }
};
































































