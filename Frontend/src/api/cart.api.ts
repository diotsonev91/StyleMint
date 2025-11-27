// src/api/cart.api.ts
import API from "./config";
import type { CartItemState, ClothesCartItem, SampleCartItem, PackCartItem } from "../state/CartItemState";

const CART_BASE = "/cart";
const ORDER_BASE = "/orders";

/**
 * Cart & Order API
 *
 * Responsibilities:
 * - Cart operations (deprecated - moved to localStorage)
 * - Order creation with Stripe integration
 * - Order preview/calculation
 */
export const cartApi = {
    // ========================================
    // CART OPERATIONS (Deprecated)
    // ========================================

    /**
     * Fetch cart from backend (deprecated - using localStorage)
     * @deprecated Use cartService with localStorage instead
     */
    async fetchCart() {
        return API.get(`${CART_BASE}`);
    },

    /**
     * Add item to backend cart (deprecated)
     * @deprecated Use cartService with localStorage instead
     */
    async addItem(item: CartItemState) {
        return API.post(`${CART_BASE}`, item);
    },

    // ========================================
    // ORDER OPERATIONS
    // ========================================

    /**
     * Create order and get Stripe payment URL
     *
     * Flow:
     * 1. Frontend sends cart items (NO prices)
     * 2. Backend calculates prices with discounts
     * 3. Backend creates order in Order microservice
     * 4. Backend returns Stripe checkout URL
     * 5. Frontend redirects to Stripe
     *
     * @param orderRequest - Order request with items
     * @returns Order response with paymentUrl
     */
    async createOrder(orderRequest: CreateOrderRequest) {
        return API.post(`${ORDER_BASE}/create`, orderRequest);
    },

    /**
     * Preview order total (without creating order)
     *
     * Calculates final price with discounts applied
     * Does NOT consume one-time discounts
     *
     * @param orderRequest - Order request with items
     * @returns Preview with total amount
     */
    async previewOrder(orderRequest: CreateOrderRequest) {
        return API.post(`${ORDER_BASE}/preview`, orderRequest);
    },

    /**
     * Get order by ID
     */
    async getOrder(orderId: string) {
        return API.get(`${ORDER_BASE}/${orderId}`);
    },

    /**
     * Get order status
     */
    async getOrderStatus(orderId: string) {
        return API.get(`${ORDER_BASE}/${orderId}/status`);
    },

    /**
     * Get order items
     */
    async getOrderItems(orderId: string) {
        return API.get(`${ORDER_BASE}/${orderId}/items`);
    },


    /**
     * Get price for a single item (clothes / sample / pack)
     * Calls backend /orders/price-item
     */
    async getItemPrice(item: OrderItemRequest) {
        return API.post(`${ORDER_BASE}/price-item`, item);
    },

    /**
     * Get user's order summary
     */
    async getMyOrderSummary() {
        return API.get(`${ORDER_BASE}/my-summary`);
    }
};

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * ProductType enum matching backend
 */
export type ProductType = 'CLOTHES' | 'SAMPLE' | 'PACK';

/**
 * PaymentMethod enum matching backend
 */
export type PaymentMethod = 'STRIPE' | 'CASH';

/**
 * Order item request (sent to backend)
 * NOTE: pricePerUnit is NOT sent from frontend - backend calculates it
 */
export interface OrderItemRequest {
    productType: ProductType;
    productId: string;
    quantity: number;
    pricePerUnit?: number; // NOT sent from frontend
    customizationJson?: string | null; // Only for CLOTHES
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
    userId: string;
    items: OrderItemRequest[];
    paymentMethod: PaymentMethod;
    deliveryAddress?: string; // Required for CLOTHES
    userName?: string;
    userPhone?: string;
}

/**
 * Create order response
 */
export interface CreateOrderResponse {
    orderId: string;
    totalAmount: number;
    paymentUrl: string | null; // Stripe URL (null for cash)
    status: string;
}

/**
 * Order preview response
 */
export interface OrderPreviewResponse {
    totalAmount: number;
    itemCount: number;
}

/**
 * Order status
 */
export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'FAILED';

/**
 * Order item status
 */
export type OrderItemStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'DIGITAL_UNLOCKED'
    | 'SHIPPED'
    | 'DELIVERED';

/**
 * Order DTO
 */
export interface OrderDTO {
    orderId: string;
    userId: string;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    deliveryAddress?: string;
    userName?: string;
    userPhone?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Order item DTO
 */
export interface OrderItemDTO {
    itemId: string;
    productType: ProductType;
    productId: string;
    quantity: number;
    pricePerUnit: number;
    itemStatus: OrderItemStatus;
    customizationJson?: string;
}

/**
 * Order status DTO
 */
export interface OrderStatusDTO {
    orderId: string;
    status: OrderStatus;
    totalAmount: number;
    itemCount: number;
    hasDigitalItems: boolean;
    hasPhysicalItems: boolean;
}

/**
 * User order summary DTO
 */
export interface UserOrderSummaryDTO {
    userId: string;
    totalOrders: number;
    totalSpent: number;
    recentOrders: OrderDTO[];
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Map frontend CartItemState to backend OrderItemRequest
 */
export function mapCartItemToOrderItem(item: CartItemState): OrderItemRequest {

    switch (item.type) {

        case 'clothes': {
            const clothesItem = item as ClothesCartItem;

            return {
                productType: 'CLOTHES',
                productId: clothesItem.id, // IMPORTANT: This must be designId, not random cart UUID
                quantity: clothesItem.quantity || 1,

                // ⭐ FULL CUSTOMIZATION JSON ⭐
                customizationJson: JSON.stringify({
                    color: clothesItem.selectedColor,
                    decal: clothesItem.selectedDecal,
                    clothType: clothesItem.selected_type,
                    decalPosition: clothesItem.decalPosition,
                    rotationY: clothesItem.rotationY,
                    ripples: clothesItem.ripples,

                    // ⭐ NEW FIELDS ⭐
                    hasCustomDecal: clothesItem.hasCustomDecal ?? false,
                    customDecalUrl: clothesItem.customDecalUrl ?? null
                })
            };
        }

        case 'sample': {
            const sampleItem = item as SampleCartItem;

            return {
                productType: 'SAMPLE',
                productId: sampleItem.id,
                quantity: sampleItem.quantity || 1,
                customizationJson: null
            };
        }

        case 'pack': {
            const packItem = item as PackCartItem;

            return {
                productType: 'PACK',
                productId: packItem.id,
                quantity: packItem.quantity || 1,
                customizationJson: null
            };
        }

        default:
            throw new Error(`Unknown cart item type: ${(item as any).type}`);
    }
}


/**
 * Validate order has required delivery address for clothes
 */
export function validateOrderRequest(request: CreateOrderRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if order has clothes
    const hasClothes = request.items.some(item => item.productType === 'CLOTHES');

    // Validate delivery address for clothes
    if (hasClothes && (!request.deliveryAddress || request.deliveryAddress.trim() === '')) {
        errors.push('Delivery address is required for clothing items');
    }

    // Validate payment method for digital items
    const hasDigital = request.items.some(item =>
        item.productType === 'SAMPLE' || item.productType === 'PACK'
    );

    if (hasDigital && request.paymentMethod === 'CASH') {
        errors.push('Digital items require Stripe payment');
    }

    // Validate items
    if (request.items.length === 0) {
        errors.push('Order must contain at least one item');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Determine payment method based on cart contents
 */
export function determinePaymentMethod(items: CartItemState[]): PaymentMethod {
    const hasDigital = items.some(item => item.type === 'sample' || item.type === 'pack');

    // Digital items always require Stripe
    if (hasDigital) {
        return 'STRIPE';
    }

    // Clothes can use either (default to Stripe)
    return 'STRIPE';
}