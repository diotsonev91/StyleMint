// CartPage.tsx - Extended for clothes, samples, and packs
import { useSnapshot } from "valtio";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartState, CartItemState } from "../../state";
import { clearCart, getClothesItems, getSampleItems, getPackItems, removeItem } from "../../services/cartService";
import { calculateTotalPrice, getTotalItemCount } from "../../services/orderService";

import "./CartPage.css";
import {ClothesCartRow} from "../../components/three/cart/ClothsCartRow";
import {SampleCartRow} from "../../components/sounds/cart/SampleCartRow";

export function CartPage() {
    const snap = useSnapshot(cartState);
    const navigate = useNavigate();

    const totalItems = getTotalItemCount();
    const totalPrice = calculateTotalPrice();

    // Group items by type for organized display
    const clothesItems = getClothesItems();
    const sampleItems = getSampleItems();
    const packItems = getPackItems();

    const handleContinueToDetails = () => {
        if (snap.items.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        navigate("/checkout/details");
    };

    const handleClearCart = () => {
        if (confirm("Are you sure you want to clear your cart?")) {
            clearCart();
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1 className="cart-title">Your Cart ({snap.items.length} {snap.items.length === 1 ? 'item' : 'items'})</h1>
                <div className="cart-header-actions">
                    {snap.items.length > 0 && (
                        <button onClick={handleClearCart} className="clear-cart-button">
                            Clear Cart
                        </button>
                    )}
                </div>
            </div>

            {snap.items.length === 0 && (
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <p className="empty-cart-text">Your cart is empty.</p>
                    <p className="empty-cart-subtext">Add items to see them here.</p>
                    <div className="empty-cart-actions">
                        <button onClick={() => navigate('/customizer')} className="btn btn-primary">
                            Customize Clothes
                        </button>
                        <button onClick={() => navigate('/samples')} className="btn btn-secondary">
                            Browse Samples
                        </button>
                    </div>
                </div>
            )}

            <div className="cart-content">
                <div className="cart-items-section">
                    {/* Clothes Section */}
                    {clothesItems.length > 0 && (
                        <div className="cart-section">
                            <h2 className="cart-section-title">
                                <span className="section-icon">👕</span>
                                Clothing ({clothesItems.length})
                            </h2>
                            {clothesItems.map((item, index) => (
                                <div key={item.id}>
                                    <ClothesCartRow item={item} />
                                    {index < clothesItems.length - 1 && <div className="cart-item-separator" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Samples Section */}
                    {sampleItems.length > 0 && (
                        <div className="cart-section">
                            <h2 className="cart-section-title">
                                <span className="section-icon">🎵</span>
                                Audio Samples ({sampleItems.length})
                            </h2>
                            {sampleItems.map((item, index) => (
                                <div key={item.id}>
                                    <SampleCartRow item={item} />
                                    {index < sampleItems.length - 1 && <div className="cart-item-separator" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Packs Section */}
                    {packItems.length > 0 && (
                        <div className="cart-section">
                            <h2 className="cart-section-title">
                                <span className="section-icon">📦</span>
                                Sample Packs ({packItems.length})
                            </h2>
                            {packItems.map((item, index) => (
                                <div key={item.id}>
                                    <PackCartRow item={item} />
                                    {index < packItems.length - 1 && <div className="cart-item-separator" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {snap.items.length > 0 && (
                    <div className="cart-sidebar">
                        <div className="cart-summary-card">
                            <h2 className="summary-title">Order Summary</h2>

                            {/* Breakdown by type */}
                            {clothesItems.length > 0 && (
                                <div className="summary-row">
                                    <span className="summary-label">Clothing ({clothesItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items):</span>
                                    <span className="summary-value">
                    ${(clothesItems.reduce((sum, item) => sum + 29.99 * (item.quantity || 1), 0)).toFixed(2)}
                  </span>
                                </div>
                            )}

                            {sampleItems.length > 0 && (
                                <div className="summary-row">
                                    <span className="summary-label">Samples ({sampleItems.length}):</span>
                                    <span className="summary-value">
                    ${(sampleItems.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}
                  </span>
                                </div>
                            )}

                            {packItems.length > 0 && (
                                <div className="summary-row">
                                    <span className="summary-label">Packs ({packItems.length}):</span>
                                    <span className="summary-value">
                    ${(packItems.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}
                  </span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span className="summary-label">Shipping:</span>
                                <span className="summary-value">Calculated at checkout</span>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-row summary-total">
                                <span className="summary-label">Total ({totalItems} items):</span>
                                <span className="summary-value">${totalPrice.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleContinueToDetails}
                                className="checkout-button"
                            >
                                Continue to Order Details
                            </button>

                            <div className="secure-checkout-badge">
                                🔒 Secure Checkout
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// PACK CART ROW
// ==========================================
function PackCartRow({ item }: { item: CartItemState & { type: 'pack' } }) {
    const [expanded, setExpanded] = useState(false);

    const _removeItem = () => {
        removeItem(item.id);
    };

    return (
        <div className="cart-item-card pack-card">
            <button onClick={_removeItem} className="remove-button" title="Remove item">
                ✕
            </button>

            {/* Cover Image */}
            <div className="pack-preview">
                {item.coverImage ? (
                    <img src={item.coverImage} alt={item.name} className="pack-cover-image" />
                ) : (
                    <div className="pack-cover-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>
                )}

                {item.sampleCount && (
                    <div className="pack-sample-count-badge">
                        {item.sampleCount} Samples
                    </div>
                )}
            </div>

            <div className="cart-item-details pack-details">
                <div className="pack-info">
                    <h3 className="item-name">{item.name}</h3>
                    {item.artist && <p className="pack-artist">{item.artist}</p>}

                    {item.description && (
                        <p className="pack-description">{item.description}</p>
                    )}

                    {item.genres && item.genres.length > 0 && (
                        <div className="pack-genres">
                            {item.genres.slice(0, 3).map(genre => (
                                <span key={genre} className="genre-badge">{genre}</span>
                            ))}
                            {item.genres.length > 3 && (
                                <span className="genre-badge more">+{item.genres.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Sample List Preview */}
                    {item.samples && item.samples.length > 0 && (
                        <div className="pack-samples-preview">
                            <button
                                className="toggle-samples-btn"
                                onClick={() => setExpanded(!expanded)}
                            >
                                <span>{expanded ? '▼' : '▶'} Includes {item.samples.length} samples</span>
                            </button>

                            {expanded && (
                                <ul className="pack-samples-list">
                                    {item.samples.slice(0, 5).map(sample => (
                                        <li key={sample.id}>
                                            {sample.name}
                                            {sample.bpm && ` • ${sample.bpm} BPM`}
                                            {sample.key && ` • ${sample.key}`}
                                        </li>
                                    ))}
                                    {item.samples.length > 5 && (
                                        <li className="more-samples">
                                            and {item.samples.length - 5} more...
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="pack-price-section">
                    <div className="item-price">${item.price.toFixed(2)}</div>
                    <div className="digital-badge">Digital Download</div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;