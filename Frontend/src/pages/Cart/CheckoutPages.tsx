// CheckoutPages.tsx - CORRECTED with orderService integration
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { clearCart } from "../../services/cartService";
import type { OrderDTO } from "../../api/cart.api";
import "./CheckoutPages.css";

// =====================================================
// CheckoutSuccess - Success page after Stripe payment
// =====================================================

export function CheckoutSuccess() {
    console.log("✅ SUCCESS PAGE RENDERED");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get orderId from URL params or sessionStorage
    const orderIdFromUrl = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id"); // Stripe session ID

    useEffect(() => {
        loadOrderDetails();
    }, [orderIdFromUrl, sessionId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);

            // Get orderId (from URL or sessionStorage)
            let orderId = orderIdFromUrl;

            if (!orderId) {
                // Try to get from sessionStorage (set by orderService)
                orderId = orderService.getPendingOrderId();
            }

            if (!orderId) {
                throw new Error("No order ID found");
            }

            console.log("📦 Loading order:", orderId);

            // Handle payment success (gets order details and clears cart)
            const orderData = await orderService.handlePaymentSuccess(orderId);
            setOrder(orderData);

            // Clear cart
            clearCart();

            console.log("✅ Order loaded successfully");

        } catch (err: any) {
            console.error("❌ Failed to load order:", err);
            setError(err.message || "Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h2 className="loading-title">Loading Order Details...</h2>
                        <p className="loading-subtitle">Please wait</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h2 className="error-title">Something went wrong</h2>
                        <p className="error-subtitle">{error || "Failed to load order"}</p>
                        <div className="checkout-buttons">
                            <Link to="/orders" className="checkout-btn checkout-btn-primary">
                                View My Orders
                            </Link>
                            <Link to="/" className="checkout-btn checkout-btn-secondary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Success Icon with Animation */}
                <div className="success-icon-container">
                    <div className="success-icon">
                        <svg
                            className="w-12 h-12 text-white"
                            style={{ width: '3rem', height: '3rem' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                className="success-checkmark"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="success-title">Payment Successful! 🎉</h1>
                <p className="success-subtitle">Thank you for your order</p>

                {/* Order Details */}
                <div className="order-details">
                    <h3 className="order-details-title">Order Details</h3>
                    <div>
                        <div className="order-detail-row">
                            <span className="order-detail-label">Order ID:</span>
                            <span className="order-detail-value">#{order.orderId}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="order-detail-label">Total Amount:</span>
                            <span className="order-detail-value">
                {orderService.formatAmount(order.totalAmount)}
              </span>
                        </div>
                        <div className="order-detail-row">
                            <span className="order-detail-label">Status:</span>
                            <span className="order-detail-value order-status-badge">{order.status}</span>
                        </div>
                        <div className="order-detail-row">
                            <span className="order-detail-label">Payment Method:</span>
                            <span className="order-detail-value">
                💳 {order.paymentMethod}
              </span>
                        </div>
                        {order.deliveryAddress && (
                            <div className="order-detail-row">
                                <span className="order-detail-label">Delivery Address:</span>
                                <span className="order-detail-value">
                  {order.deliveryAddress}
                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Messages */}
                <div className="info-messages">
                    <p className="info-message">
                        <span>📧</span>
                        <span>A confirmation email has been sent</span>
                    </p>
                    <p className="info-message">
                        <span>🎨</span>
                        <span>Your custom items are now being prepared!</span>
                    </p>
                    <p className="info-message">
                        <span>🎵</span>
                        <span>Digital items are now available in your library</span>
                    </p>
                </div>

                {/* Payment Status Box */}
                <div className="payment-status-box paid">
                    <div className="status-icon">✓</div>
                    <div>
                        <div className="status-title">Payment Confirmed</div>
                        <div className="status-desc">Your payment has been processed successfully</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="checkout-buttons">
                    <Link to={`/orders/${order.orderId}`} className="checkout-btn checkout-btn-primary">
                        View Order Details
                    </Link>
                    <Link to="/" className="checkout-btn checkout-btn-secondary">
                        Continue Shopping
                    </Link>
                </div>

                <p className="success-note">
                    You can track your order status in the Orders page
                </p>
            </div>
        </div>
    );
}

// =====================================================
// CheckoutCancel - Cancel page when user cancels Stripe payment
// =====================================================

export function CheckoutCancel() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderIdFromUrl = searchParams.get("orderId");

    useEffect(() => {
        console.log("❌ Payment cancelled by user");

        // Get orderId
        let orderId = orderIdFromUrl;
        if (!orderId) {
            orderId = orderService.getPendingOrderId();
        }

        // Handle cancellation
        if (orderId) {
            orderService.handlePaymentCancel(orderId);
        }
    }, [orderIdFromUrl]);

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Cancel Icon */}
                <div className="cancel-icon-container">
                    <div className="cancel-icon">😕</div>
                </div>

                <h1 className="cancel-title">Payment Cancelled</h1>

                <p className="cancel-subtitle">
                    Your payment was cancelled. Your items are still in your cart if you'd like to try again.
                </p>

                <div className="info-messages">
                    <p className="info-message">
                        <span>🛒</span>
                        <span>Your cart items have been saved</span>
                    </p>
                    <p className="info-message">
                        <span>🔒</span>
                        <span>No charges were made to your card</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="checkout-buttons" style={{ flexDirection: 'column' }}>
                    <Link to="/cart" className="checkout-btn checkout-btn-primary checkout-btn-block">
                        Return to Cart
                    </Link>
                    <Link to="/" className="checkout-btn checkout-btn-secondary checkout-btn-block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}