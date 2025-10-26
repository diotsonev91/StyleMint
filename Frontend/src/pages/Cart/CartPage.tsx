import { useSnapshot } from "valtio";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartState } from "../../state";
import { refreshCart } from "../../services/CartService";
import { ThreeCanvas } from "../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import "./CartPage.css";

export function CartPage() {
  const snap = useSnapshot(cartState);
  const navigate = useNavigate();

  const totalItems = snap.items.reduce((sum, item) => sum + ((item as any).quantity || 1), 0);
  const totalPrice = snap.items.reduce((sum, item) => {
    const quantity = (item as any).quantity || 1;
    return sum + (29.99 * quantity);
  }, 0);

  const handleContinueToDetails = () => {
    if (snap.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout/details");
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Your Cart ({snap.items.length} items)</h1>
        <button onClick={refreshCart} className="refresh-button">
          Refresh Cart
        </button>
      </div>

      {snap.items.length === 0 && (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p className="empty-cart-text">Your cart is empty.</p>
          <p className="empty-cart-subtext">Add items from the customizer to see them here.</p>
        </div>
      )}

      <div className="cart-content">
        <div className="cart-items-section">
          {snap.items.map((item, index) => (
            <div key={item.id}>
              <CartRow itemId={item.id} />
              {index < snap.items.length - 1 && <div className="cart-item-separator" />}
            </div>
          ))}
        </div>

        {snap.items.length > 0 && (
          <div className="cart-sidebar">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal ({totalItems} items):</span>
                <span className="summary-value">${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Shipping:</span>
                <span className="summary-value">Calculated at checkout</span>
              </div>
              
              <div className="summary-divider" />
              
              <div className="summary-row summary-total">
                <span className="summary-label">Total:</span>
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

function CartRow({ itemId }: { itemId: string }) {
  const snap = useSnapshot(cartState);
  const item = snap.items.find(i => i.id === itemId);

  if (!item) {
    console.error("❌ Item not found:", itemId);
    return null;
  }

  const [rot, setRot] = useState<number>(item.rotationY ?? 0);
  const quantity = (item as any).quantity || 1;
  const itemTotal = 29.99 * quantity;

  // Check if this item was created in advanced mode
  const isAdvancedMode = !!(item as any).decalPosition; // advanced mode has decalPosition

  useEffect(() => {
    setRot(item.rotationY ?? 0);
  }, [item.id, item.rotationY]);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    const itemIndex = cartState.items.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      (cartState.items[itemIndex] as any).quantity = newQuantity;
    }
  };

  const removeItem = () => {
    cartState.items = cartState.items.filter((x) => x.id !== item.id);
  };

  return (
    <div className="cart-item-card">
      <button onClick={removeItem} className="remove-button" title="Remove item">
        ✕
      </button>

      {/* Mode Badge */}
      <div className="mode-badge">
        {isAdvancedMode ? "🎨 Advanced" : "✨ Easy"}
      </div>

      {/* BIGGER PREVIEW - 500x500 - Use correct canvas based on mode */}
      <div className="cart-item-preview">
        {isAdvancedMode ? (
          <ThreeCanvasAdvanced 
            isInsideCart 
            cartItem={item as any} 
            tempRotationY={rot} 
          />
        ) : (
          <ThreeCanvas 
            isInsideCart 
            cartItem={item as any} 
            tempRotationY={rot} 
          />
        )}
      </div>

      <div className="cart-item-details">
        <div className="item-info-section">
          <h3 className="item-name">{item.selected_type.replace(/_/g, ' ').toUpperCase()}</h3>
          
          <div className="item-specs">
            <div className="spec-row">
              <span className="spec-label">Decal:</span>
              <span className="spec-value">{item.selectedDecal}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Color:</span>
              <div className="color-display">
                <div className="color-swatch" style={{ backgroundColor: item.selectedColor }}></div>
                <span className="spec-value">{item.selectedColor}</span>
              </div>
            </div>
            {isAdvancedMode && (item as any).ripples && (item as any).ripples.length > 0 && (
              <div className="spec-row">
                <span className="spec-label">Ripples:</span>
                <span className="spec-value">{(item as any).ripples.length} effect(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="quantity-section">
          <label className="quantity-label">Quantity</label>
          <div className="quantity-controls">
            <button
              onClick={() => updateQuantity(quantity - 1)}
              className="quantity-btn quantity-decrease"
              disabled={quantity <= 1}
            >
              −
            </button>
            <div className="quantity-display">{quantity}</div>
            <button
              onClick={() => updateQuantity(quantity + 1)}
              className="quantity-btn quantity-increase"
            >
              +
            </button>
          </div>
          <div className="item-price">${itemTotal.toFixed(2)}</div>
        </div>

        <div className="rotation-section">
          <label className="rotation-label">
            Preview Rotation: {Math.round(rot)}°
          </label>
          <input
            type="range"
            min={0}
            max={360}
            value={rot}
            onChange={(e) => setRot(+e.target.value)}
            className="rotation-slider"
          />
        </div>
      </div>
    </div>
  );
}