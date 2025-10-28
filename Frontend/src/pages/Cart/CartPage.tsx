// CartPage.tsx - Extended for clothes, samples, and packs
import { useSnapshot } from "valtio";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartState, CartItemState } from "../../state";
import { clearCart,addClothToCart, addSampleToCart, updateItemQuantity, removeItem,
    addPackToCart, getClothesItems, getSampleItems, getPackItems} from "../../services/CartService";
import { calculateTotalPrice, getTotalItemCount } from "../../services/OrderService";
import { ThreeCanvas } from "../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import { audioPlayerActions, formatTime } from "../../state/audioPlayer.store";
import "./CartPage.css";

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
// CLOTHES CART ROW
// ==========================================
function ClothesCartRow({ item }: { item: CartItemState & { type: 'clothes' } }) {
  const [rot, setRot] = useState<number>(item.rotationY ?? 0);
  const quantity = item.quantity || 1;
  const itemTotal = 29.99 * quantity;

  // Check if this item was created in advanced mode
  const isAdvancedMode = !!item.decalPosition;

  useEffect(() => {
    setRot(item.rotationY ?? 0);
  }, [item.id, item.rotationY]);

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(item.id, newQuantity);
  };

  const _removeItem = () => {
    removeItem(item.id);
  };

  return (
    <div className="cart-item-card clothes-card">
      <button onClick={_removeItem} className="remove-button" title="Remove item">
        ✕
      </button>

      {/* Mode Badge */}
      <div className="mode-badge">
        {isAdvancedMode ? "🎨 Advanced" : "✨ Easy"}
      </div>

      {/* Preview */}
      <div className="cart-item-preview">
        {isAdvancedMode ? (
          <ThreeCanvasAdvanced 
            isInsideCart 
            cartItem={item} 
            tempRotationY={rot} 
          />
        ) : (
          <ThreeCanvas 
            isInsideCart 
            cartItem={item} 
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
            {isAdvancedMode && item.ripples && item.ripples.length > 0 && (
              <div className="spec-row">
                <span className="spec-label">Ripples:</span>
                <span className="spec-value">{item.ripples.length} effect(s)</span>
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

// ==========================================
// SAMPLE CART ROW
// ==========================================
function SampleCartRow({ item }: { item: CartItemState & { type: 'sample' } }) {
  const _removeItem = () => {
    removeItem(item.id);
  };

  const handlePlay = () => {
    if (item.url) {
      audioPlayerActions.playSample({
        id: item.id,
        name: item.name,
        audioUrl: item.url,
        artist: item.artist || "",
        duration: item.duration || 0,
        bpm: item.bpm,
        key: item.key,
        genre: item.genre,
        price: item.price,
        sampleType: "oneshot",
      });
    }
  };

  return (
    <div className="cart-item-card sample-card">
      <button onClick={_removeItem} className="remove-button" title="Remove item">
        ✕
      </button>

      {/* Cover Image */}
      <div className="sample-preview">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.name} className="sample-cover-image" />
        ) : (
          <div className="sample-cover-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        )}
        
        {/* Play Button */}
        {item.url && (
          <button className="sample-play-btn" onClick={handlePlay}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>

      <div className="cart-item-details sample-details">
        <div className="sample-info">
          <h3 className="item-name">{item.name}</h3>
          {item.artist && <p className="sample-artist">{item.artist}</p>}
          
          <div className="sample-metadata">
            {item.genre && <span className="metadata-badge">{item.genre}</span>}
            {item.bpm && <span className="metadata-badge">{item.bpm} BPM</span>}
            {item.key && <span className="metadata-badge">Key: {item.key}</span>}
            {item.duration && <span className="metadata-badge">{formatTime(item.duration)}</span>}
          </div>
        </div>

        <div className="sample-price-section">
          <div className="item-price">${item.price.toFixed(2)}</div>
          <div className="digital-badge">Digital Download</div>
        </div>
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