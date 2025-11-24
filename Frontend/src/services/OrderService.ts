// src/services/orderService.ts
import {
    cartApi,
    CreateOrderRequest,
    CreateOrderResponse,
    OrderPreviewResponse,
    OrderDTO,
    OrderStatusDTO,
    mapCartItemToOrderItem,
    validateOrderRequest,
    determinePaymentMethod,
    type PaymentMethod
} from '../api/cart.api';
import type { CartItemState } from '../state/CartItemState';

/**
 * Order Service - handles order creation and Stripe integration
 *
 * Responsibilities:
 * - Convert cart items to order request
 * - Create orders with backend
 * - Handle Stripe redirect
 * - Preview order totals
 * - Track order status
 */
export const orderService = {
    /**
     * Create order from cart and redirect to Stripe
     *
     * Flow:
     * 1. Convert cart items to order request
     * 2. Validate order (delivery address, payment method)
     * 3. Send to backend (backend calculates prices)
     * 4. Redirect to Stripe checkout URL
     * 5. Clear cart after successful redirect
     *
     * @param cartItems - Items from cart
     * @param userId - Authenticated user ID
     * @param deliveryAddress - Delivery address (required for clothes)
     * @param paymentMethod - Payment method (default: auto-determined)
     * @param userInfo - Optional user contact info
     * @returns Order response with payment URL
     */
    async createOrderAndPay(
        cartItems: CartItemState[],
        userId: string,
        deliveryAddress?: string,
        paymentMethod?: PaymentMethod,
        userInfo?: {
            name?: string;
            phone?: string;
        }
    ): Promise<CreateOrderResponse> {
        try {
            // 1. Map cart items to order items
            const orderItems = cartItems.map(item => mapCartItemToOrderItem(item));

            // 2. Determine payment method if not provided
            const finalPaymentMethod = paymentMethod || determinePaymentMethod(cartItems);

            // 3. Create order request
            const orderRequest: CreateOrderRequest = {
                userId,
                items: orderItems,
                paymentMethod: finalPaymentMethod,
                deliveryAddress,
                userName: userInfo?.name,
                userPhone: userInfo?.phone
            };

            // 4. Validate order
            const validation = validateOrderRequest(orderRequest);
            if (!validation.valid) {
                throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
            }

            // 5. Send to backend
            const response = await cartApi.createOrder(orderRequest);
            const orderResponse = response.data as CreateOrderResponse;

            console.log('✅ Order created:', orderResponse.orderId);

            // 6. Redirect to Stripe if payment URL exists
            if (orderResponse.paymentUrl) {
                console.log('🔄 Redirecting to Stripe checkout...');
                // Store order ID for confirmation page
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pendingOrderId', orderResponse.orderId);
                }

                // Redirect to Stripe
                window.location.href = orderResponse.paymentUrl;
            } else {
                // Cash payment - no redirect needed
                console.log('💵 Cash payment - Order created successfully');
            }

            return orderResponse;

        } catch (error: any) {
            console.error('❌ Order creation failed:', error);

            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to create order'
            );
        }
    },

    /**
     * Preview order total without creating order
     *
     * Used in cart page to show final price with discounts
     * Does NOT consume one-time discounts
     *
     * @param cartItems - Items from cart
     * @param userId - Authenticated user ID
     * @returns Preview with total amount
     */
    async previewOrderTotal(
        cartItems: CartItemState[],
        userId: string
    ): Promise<OrderPreviewResponse> {
        try {
            // 1. Map cart items to order items
            const orderItems = cartItems.map(item => mapCartItemToOrderItem(item));

            // 2. Create preview request
            const orderRequest: CreateOrderRequest = {
                userId,
                items: orderItems,
                paymentMethod: 'STRIPE' // Doesn't matter for preview
            };

            // 3. Send to backend
            const response = await cartApi.previewOrder(orderRequest);
            const preview = response.data as OrderPreviewResponse;

            console.log('📊 Order preview:', preview);

            return preview;

        } catch (error: any) {
            console.error('❌ Order preview failed:', error);

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to preview order'
            );
        }
    },

    /**
     * Get order by ID
     */
    async getOrder(orderId: string): Promise<OrderDTO> {
        try {
            const response = await cartApi.getOrder(orderId);
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to get order:', error);
            throw new Error('Failed to load order');
        }
    },

    /**
     * Get order status
     */
    async getOrderStatus(orderId: string): Promise<OrderStatusDTO> {
        try {
            const response = await cartApi.getOrderStatus(orderId);
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to get order status:', error);
            throw new Error('Failed to load order status');
        }
    },

    /**
     * Get my order summary
     */
    async getMyOrderSummary() {
        try {
            const response = await cartApi.getMyOrderSummary();
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to get order summary:', error);
            throw new Error('Failed to load order summary');
        }
    },

    /**
     * Handle Stripe payment success callback
     *
     * Called when user returns from Stripe checkout
     *
     * @param orderId - Order ID from URL params
     * @returns Order details
     */
    async handlePaymentSuccess(orderId: string): Promise<OrderDTO> {
        try {
            console.log('✅ Payment successful for order:', orderId);

            // Get order details
            const order = await orderService.getOrder(orderId);

            // Clear pending order from session
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pendingOrderId');
            }

            return order;

        } catch (error: any) {
            console.error('❌ Failed to handle payment success:', error);
            throw new Error('Failed to load order details');
        }
    },

    /**
     * Handle Stripe payment cancellation
     *
     * Called when user cancels Stripe checkout
     *
     * @param orderId - Order ID from URL params
     */
    handlePaymentCancel(orderId: string): void {
        console.log('❌ Payment cancelled for order:', orderId);

        // Clear pending order from session
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pendingOrderId');
        }
    },

    /**
     * Get pending order ID from session
     */
    getPendingOrderId(): string | null {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('pendingOrderId');
        }
        return null;
    },

    /**
     * Format order amount for display
     */
    formatAmount(amount: number, currency = '€'): string {
        return `${currency}${amount.toFixed(2)}`;
    },

    /**
     * Check if order has digital items
     */
    hasDigitalItems(cartItems: CartItemState[]): boolean {
        return cartItems.some(item => item.type === 'sample' || item.type === 'pack');
    },

    /**
     * Check if order has physical items
     */
    hasPhysicalItems(cartItems: CartItemState[]): boolean {
        return cartItems.some(item => item.type === 'clothes');
    },

    /**
     * Validate delivery address is required
     */
    isDeliveryAddressRequired(cartItems: CartItemState[]): boolean {
        return orderService.hasPhysicalItems(cartItems);
    }
};