// CheckoutSummary.tsx - WITH DISCOUNT BREAKDOWN
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { cartState } from "../../state/CartItemState";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import { orderService } from "../../services/orderService";
import { discountService } from "../../services/discountService";  // ← ADD THIS
import { clearCart, hasPhysicalItems, hasDigitalItems } from "../../services/cartService";
import { useAuth } from "../../hooks/useAuth";
import type { OrderDetails } from "./CheckoutDetails";
import type { ClothesCartItem } from "../../state/CartItemState";
import type { CartDiscountBreakdown } from "../../types/discountTypes";  // ← ADD THIS
import "./CheckoutSummary.css";

export function CheckoutSummary() {
    const navigate = useNavigate();
    const snap = useSnapshot(cartState);
    const { user } = useAuth();

    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ← ADD DISCOUNT BREAKDOWN STATE
    const [discountBreakdown, setDiscountBreakdown] = useState<CartDiscountBreakdown | null>(null);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);

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
            return;
        }

        // ← LOAD DISCOUNT BREAKDOWN
        loadDiscountBreakdown();
    }, [navigate, snap.items.length, user]);

    // ← ADD THIS FUNCTION
    const loadDiscountBreakdown = async () => {
        if (snap.items.length === 0) return;

        try {
            setLoadingDiscounts(true);
            const breakdown = await discountService.getCartBreakdown(snap.items);
            setDiscountBreakdown(breakdown);
        } catch (err) {
            console.error("Failed to load discount breakdown:", err);
            // Non-critical error - continue without breakdown
        } finally {
            setLoadingDiscounts(false);
        }
    };

    // Calculate totals from discount breakdown (if available) or fallback to estimates
    const subtotal = discountBreakdown?.cartBasePrice ?? snap.items.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        return sum + (price * quantity);
    }, 0);

    const finalPrice = discountBreakdown?.cartFinalPrice ?? subtotal;
    const totalSavings = discountBreakdown?.totalSavings ?? 0;


    const total = finalPrice;

    const handlePlaceOrder = async () => {
        if (!orderDetails || !user) return;

        setIsProcessing(true);
        setError(null);

        try {
            console.log("📦 Creating order with orderService...");

            const deliveryAddress = hasPhysicalItems()
                ? `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} ${orderDetails.zipCode}, ${orderDetails.country}`
                : undefined;

            await orderService.createOrderAndPay(
                [...snap.items],
                user.id,
                deliveryAddress,
                'STRIPE',
                {
                    name: orderDetails.fullName,
                    phone: orderDetails.phone
                }
            );

            clearCart();
            navigate("/checkout/success");

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

                        {snap.items.map((item, index) => {
                            const quantity = item.quantity || 1;
                            const itemPrice = item.price || 0;

                            // Get item-specific discount info if available
                            const itemBreakdown = discountBreakdown?.items[index];

                            return (
                                <div key={item.id} className="summary-item-card">
                                    {/* Preview based on type */}
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
                                        {/* Item details based on type */}
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

                                        {/* ← ENHANCED PRICING WITH DISCOUNT INFO */}
                                        <div className="summary-item-price">
                                            {itemBreakdown ? (
                                                <>
                                                    {itemBreakdown.basePrice !== itemBreakdown.finalPrice && (
                                                        <span className="original-price-strike">
                                                            {discountService.formatPrice(itemBreakdown.basePrice * quantity)}
                                                        </span>
                                                    )}
                                                    <span className="final-price">
                                                        {discountService.formatPrice(itemBreakdown.finalPrice * quantity)}
                                                    </span>
                                                    {itemBreakdown.totalDiscountPercent > 0 && (
                                                        <span className="discount-badge">
                                                            {discountService.formatPercent(itemBreakdown.totalDiscountPercent)} OFF
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    €{(itemPrice * quantity).toFixed(2)}
                                                    {loadingDiscounts && <span className="loading-discounts">Loading discounts...</span>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}


                    {/* ========== DISCOUNT BREAKDOWN SECTION ========== */}
                    {discountBreakdown && discountBreakdown.items.some(item => item.totalDiscountPercent > 0) && (
                        <div className="discount-breakdown-section">
                            <h3 className="discount-breakdown-title">
                                💰 Active Discounts Breakdown
                            </h3>

                            <div className="discount-breakdown-grid">
                                {discountBreakdown.items.map((itemBreakdown, index) => {
                                    // Skip items with no discounts
                                    if (itemBreakdown.totalDiscountPercent === 0) return null;

                                    const cartItem = snap.items[index];

                                    return (
                                        <div key={index} className="discount-item-card">
                                            <div className="discount-item-header">
                            <span className="discount-item-icon">
                                {itemBreakdown.productType === 'CLOTHES' && '👕'}
                                {itemBreakdown.productType === 'SAMPLE' && '🎵'}
                                {itemBreakdown.productType === 'PACK' && '📦'}
                            </span>
                                                <div className="discount-item-title">
                                                    <h4>
                                                        {cartItem?.type === 'clothes'
                                                            ? cartItem.selected_type.replace(/_/g, ' ').toUpperCase()
                                                            : cartItem?.name
                                                        }
                                                    </h4>
                                                    <span className="discount-item-qty">x{itemBreakdown.quantity}</span>
                                                </div>
                                            </div>

                                            <div className="discount-stages">
                                                {/* Product-Specific Discount */}
                                                {itemBreakdown.productSpecificDiscountPercent > 0 && (
                                                    <div className="discount-stage">
                                                        <div className="discount-stage-icon">🎨</div>
                                                        <div className="discount-stage-info">
                                                            <span className="discount-stage-label">Bonus Points</span>
                                                            <span className="discount-stage-value">
                                            -{discountService.formatPercent(itemBreakdown.productSpecificDiscountPercent)}
                                        </span>
                                                        </div>
                                                        <div className="discount-stage-amount">
                                                            {discountService.formatPrice(
                                                                itemBreakdown.basePrice - itemBreakdown.priceAfterProductDiscount
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* NFT Discount */}
                                                {itemBreakdown.nftDiscountPercent > 0 && (
                                                    <div className="discount-stage">
                                                        <div className="discount-stage-icon">🏆</div>
                                                        <div className="discount-stage-info">
                                                            <span className="discount-stage-label">NFT Badge</span>
                                                            <span className="discount-stage-value">
                                            -{discountService.formatPercent(itemBreakdown.nftDiscountPercent)}
                                        </span>
                                                        </div>
                                                        <div className="discount-stage-amount">
                                                            {discountService.formatPrice(
                                                                itemBreakdown.priceAfterProductDiscount - itemBreakdown.priceAfterNftDiscount
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* One-Time Discount */}
                                                {itemBreakdown.oneTimeDiscountPercent > 0 && (
                                                    <div className="discount-stage">
                                                        <div className="discount-stage-icon">🎮</div>
                                                        <div className="discount-stage-info">
                                                            <span className="discount-stage-label">Game Reward</span>
                                                            <span className="discount-stage-value">
                                            -{discountService.formatPercent(itemBreakdown.oneTimeDiscountPercent)}
                                        </span>
                                                        </div>
                                                        <div className="discount-stage-amount">
                                                            {discountService.formatPrice(
                                                                itemBreakdown.priceAfterNftDiscount - itemBreakdown.finalPrice
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Total Savings for This Item */}
                                            <div className="discount-item-total">
                                                <span>Total Saved:</span>
                                                <span className="discount-item-total-amount">
                                -{discountService.formatPrice(
                                                    (itemBreakdown.basePrice - itemBreakdown.finalPrice) * itemBreakdown.quantity
                                                )}
                            </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Overall Summary */}
                            <div className="discount-overall-summary">
                                <div className="discount-summary-row">
                                    <span>Total Savings Across All Items:</span>
                                    <span className="discount-summary-total">
                    -{discountService.formatPrice(totalSavings)}
                </span>
                                </div>
                                <p className="discount-summary-note">
                                    💡 Your discounts stack! Bonus points + NFT badge + game rewards = maximum savings
                                </p>
                            </div>
                        </div>
                    )}
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

                        {/* ← ENHANCED PRICE SUMMARY WITH DISCOUNTS */}
                        <div className="summary-card price-summary">
                            <h3 className="summary-card-title">
                                {discountBreakdown ? "Final Price" : "Price Estimate"}
                            </h3>

                            {/* Original Subtotal */}
                            <div className="price-row">
                                <span>Subtotal:</span>
                                <span className={totalSavings > 0 ? "strike-through" : ""}>
                                    €{subtotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Discount Savings */}
                            {totalSavings > 0 && (
                                <div className="price-row discount-row">
                                    <span>💰 Your Savings:</span>
                                    <span className="savings-amount">
                                        -€{totalSavings.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {/* Price After Discounts */}
                            {totalSavings > 0 && (
                                <div className="price-row">
                                    <span>After Discounts:</span>
                                    <span className="discounted-price">
                                        €{finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            )}


                            <div className="price-divider" />

                            {/* Final Total */}
                            <div className="price-row price-total">
                                <span>Total:</span>
                                <span>€{total.toFixed(2)}</span>
                            </div>

                            {/* Discount Summary */}
                            {discountBreakdown && totalSavings > 0 && (
                                <div className="discount-summary-box">
                                    <p className="discount-summary-title">🎉 You're saving</p>
                                    <p className="discount-summary-amount">
                                        €{totalSavings.toFixed(2)}
                                        ({discountService.formatPercent(discountBreakdown.totalSavingsPercent)})
                                    </p>
                                </div>
                            )}

                            {!discountBreakdown && !loadingDiscounts && (
                                <p className="price-disclaimer">
                                    * Discounts will be applied automatically
                                </p>
                            )}
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
                                {totalSavings > 0 && (
                                    <li>✅ Your discounts have been applied!</li>
                                )}
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