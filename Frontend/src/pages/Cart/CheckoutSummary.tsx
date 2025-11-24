// CheckoutSummary.tsx - CORRECTED with orderService integration
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { cartState } from "../../state/CartItemState";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import { orderService } from "../../services/orderService";
import { clearCart, hasPhysicalItems, hasDigitalItems } from "../../services/cartService";
import { useAuth } from "../../hooks/useAuth";
import type { OrderDetails } from "./CheckoutDetails";
import type { ClothesCartItem } from "../../state/CartItemState";
import "./CheckoutSummary.css";

// Helper function to get item price (client-side estimate)
const getItemPrice = (item: any): number => {
    switch (item.type) {
        case 'clothes':
            return 29.99; // Base price - real price calculated server-side
        case 'sample':
            return item.price;
        case 'pack':
            return item.price;
        default:
            return 0;
    }
};

// Helper function to get item total (price * quantity)
const getItemTotal = (item: any): number => {
    const quantity = item.quantity || 1;
    return getItemPrice(item) * quantity;
};

export function CheckoutSummary() {
    const navigate = useNavigate();
    const snap = useSnapshot(cartState);
    const { user } = useAuth();

    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            navigate("/login");
            return;
        }

        // Load order details
        const savedDetails = localStorage.getItem("orderDetails");
        if (!savedDetails) {
            navigate("/checkout/details");
            return;
        }
        setOrderDetails(JSON.parse(savedDetails));

        // If cart is empty, redirect
        if (snap.items.length === 0) {
            navigate("/cart");
        }
    }, [navigate, snap.items.length, user]);

    // Calculate client-side totals (estimates)
    const subtotal = snap.items.reduce((sum, item) => {
        return sum + getItemTotal(item);
    }, 0);

    const shipping = hasPhysicalItems() ? 9.99 : 0; // No shipping for digital only
    const tax = subtotal * 0.08; // 8% tax (example)
    const total = subtotal + shipping + tax;

    const handlePlaceOrder = async () => {
        if (!orderDetails || !user) return;

        setIsProcessing(true);
        setError(null);

        try {
            console.log("📦 Creating order with orderService...");

            // Determine delivery address
            const deliveryAddress = hasPhysicalItems()
                ? `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} ${orderDetails.zipCode}, ${orderDetails.country}`
                : undefined;

            // Create order and redirect to Stripe
            // orderService will automatically redirect to Stripe if paymentUrl exists
            await orderService.createOrderAndPay(
                [...snap.items],
                user.id,
                deliveryAddress,
                'STRIPE', // Always use Stripe for now
                {
                    name: orderDetails.fullName,
                    phone: orderDetails.phone
                }
            );

            // If we reach here, it means no Stripe redirect (cash payment)
            // Clear cart and go to success
            clearCart();
            navigate("/checkout/success");

            // Note: If Stripe redirect happens, this code won't execute
            // because window.location.href changes

        } catch (err: any) {
            console.error("❌ Order failed:", err);
            setError(err.message || "Failed to place order. Please try again.");
            setIsProcessing(false);
        }
    };

    if (!orderDetails || !user) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container-wide">
                <div className="checkout-header">
                    <button onClick={() => navigate("/checkout/details")} className="back-button">
                        ← Edit Details
                    </button>
                    <h1 className="checkout-title">Order Summary</h1>
                    <div className="checkout-steps">
                        <div className="step completed">1. Details ✓</div>
                        <div className="step-divider" />
                        <div className="step active">2. Summary</div>
                        <div className="step-divider" />
                        <div className="step">3. Payment</div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="checkout-error">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="summary-layout">
                    {/* Left Column - Order Items */}
                    <div className="summary-items">
                        <h2 className="summary-section-title">Order Items</h2>

                        {snap.items.map((item) => {
                            const quantity = item.quantity || 1;
                            const itemTotal = getItemTotal(item);

                            return (
                                <div key={item.id} className="summary-item-card">
                                    {/* Render different previews based on item type */}
                                    {item.type === 'clothes' ? (
                                        <div className="summary-item-preview">
                                            <ThreeCanvasAdvanced
                                                isInsideCart
                                                cartItem={item as any as ClothesCartItem}
                                                tempRotationY={item.rotationY}
                                            />
                                        </div>
                                    ) : item.type === 'sample' ? (
                                        <div className="summary-item-preview summary-item-audio">
                                            <div className="audio-icon">🎵</div>
                                            {item.coverImage && (
                                                <img
                                                    src={item.coverImage}
                                                    alt={item.name}
                                                    className="audio-cover"
                                                />
                                            )}
                                        </div>
                                    ) : item.type === 'pack' ? (
                                        <div className="summary-item-preview summary-item-pack">
                                            <div className="pack-icon">📦</div>
                                            {item.coverImage && (
                                                <img
                                                    src={item.coverImage}
                                                    alt={item.name}
                                                    className="pack-cover"
                                                />
                                            )}
                                            {item.sampleCount && (
                                                <div className="pack-badge">{item.sampleCount} samples</div>
                                            )}
                                        </div>
                                    ) : null}

                                    <div className="summary-item-info">
                                        {/* Render different info based on item type */}
                                        {item.type === 'clothes' ? (
                                            <>
                                                <h3 className="summary-item-name">
                                                    {item.selected_type.replace(/_/g, ' ').toUpperCase()}
                                                </h3>
                                                <div className="summary-item-details">
                                                    <span>Color: {item.selectedColor}</span>
                                                    <span>Decal: {item.selectedDecal}</span>
                                                    <span>Quantity: {quantity}</span>
                                                </div>
                                            </>
                                        ) : item.type === 'sample' ? (
                                            <>
                                                <h3 className="summary-item-name">{item.name}</h3>
                                                <div className="summary-item-details">
                                                    {item.artist && <span>Artist: {item.artist}</span>}
                                                    {item.genre && <span>Genre: {item.genre}</span>}
                                                    {item.bpm && <span>BPM: {item.bpm}</span>}
                                                    {item.key && <span>Key: {item.key}</span>}
                                                    <span>Quantity: {quantity}</span>
                                                </div>
                                            </>
                                        ) : item.type === 'pack' ? (
                                            <>
                                                <h3 className="summary-item-name">{item.name}</h3>
                                                <div className="summary-item-details">
                                                    {item.artist && <span>Artist: {item.artist}</span>}
                                                    {item.sampleCount && <span>{item.sampleCount} samples included</span>}
                                                    {item.genres && item.genres.length > 0 && (
                                                        <span>Genres: {item.genres.join(', ')}</span>
                                                    )}
                                                    <span>Quantity: {quantity}</span>
                                                </div>
                                            </>
                                        ) : null}

                                        <div className="summary-item-price">
                                            €{itemTotal.toFixed(2)}
                                            <span className="price-note">* Estimate</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="price-calculation-note">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Final prices with your discounts will be calculated on the next page</span>
                        </div>
                    </div>

                    {/* Right Column - Details & Payment */}
                    <div className="summary-sidebar">
                        {/* Shipping Details */}
                        <div className="summary-card">
                            <h3 className="summary-card-title">Shipping Details</h3>
                            <div className="detail-group">
                                <p className="detail-name">{orderDetails.fullName}</p>
                                <p className="detail-text">{orderDetails.email}</p>
                                <p className="detail-text">{orderDetails.phone}</p>

                                {hasPhysicalItems() && (
                                    <>
                                        <p className="detail-text">{orderDetails.address}</p>
                                        <p className="detail-text">
                                            {orderDetails.city}, {orderDetails.state} {orderDetails.zipCode}
                                        </p>
                                        <p className="detail-text">{orderDetails.country}</p>
                                    </>
                                )}

                                {hasDigitalItems() && !hasPhysicalItems() && (
                                    <p className="digital-only-note">
                                        📧 Digital items only - No shipping required
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="summary-card">
                            <h3 className="summary-card-title">Payment Method</h3>
                            <div className="payment-method-display">
                                <span className="payment-icon-large">💳</span>
                                <div>
                                    <p className="payment-method-name">Stripe Payment</p>
                                    <p className="payment-method-desc">Secure card payment</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {orderDetails.notes && (
                            <div className="summary-card">
                                <h3 className="summary-card-title">Order Notes</h3>
                                <p className="detail-text">{orderDetails.notes}</p>
                            </div>
                        )}

                        {/* Price Summary (Estimates) */}
                        <div className="summary-card price-summary">
                            <h3 className="summary-card-title">Price Estimate</h3>
                            <div className="price-row">
                                <span>Subtotal:</span>
                                <span>€{subtotal.toFixed(2)}</span>
                            </div>
                            {hasPhysicalItems() && (
                                <div className="price-row">
                                    <span>Shipping:</span>
                                    <span>€{shipping.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="price-row">
                                <span>Tax (8%):</span>
                                <span>€{tax.toFixed(2)}</span>
                            </div>
                            <div className="price-divider" />
                            <div className="price-row price-total">
                                <span>Estimated Total:</span>
                                <span>€{total.toFixed(2)}</span>
                            </div>
                            <p className="price-disclaimer">
                                * Final price will include your active discounts
                            </p>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            className="place-order-button"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="spinner-small" />
                                    Creating order...
                                </>
                            ) : (
                                <>
                                    💳 Continue to Stripe Payment
                                </>
                            )}
                        </button>

                        <p className="secure-badge">
                            🔒 Your information is secure and encrypted
                        </p>

                        <div className="what-happens-next">
                            <h4>What happens next?</h4>
                            <ol>
                                <li>We'll calculate your final price with discounts</li>
                                <li>You'll be redirected to Stripe for secure payment</li>
                                <li>After payment, digital items are instantly available</li>
                                {hasPhysicalItems() && (
                                    <li>Physical items will be shipped to your address</li>
                                )}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}