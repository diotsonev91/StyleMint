import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { cartState, type CartItemState, type ClothesCartItem, type SampleCartItem, type PackCartItem } from "../../state";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import type { OrderDetails } from "./CheckoutDetails";
import "./CheckoutSummary.css";

// Type helper to handle readonly types from useSnapshot
type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type ReadonlyCartItem = DeepReadonly<CartItemState>;

// Helper function to get item price
const getItemPrice = (item: ReadonlyCartItem): number => {
  switch (item.type) {
    case 'clothes':
      return 29.99;
    case 'sample':
      return item.price;
    case 'pack':
      return item.price;
    default:
      return 0;
  }
};

// Helper function to get item total (price * quantity)
const getItemTotal = (item: ReadonlyCartItem): number => {
  const quantity = item.quantity || 1;
  return getItemPrice(item) * quantity;
};

export function CheckoutSummary() {
  const navigate = useNavigate();
  const snap = useSnapshot(cartState);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load order details
    const savedDetails = localStorage.getItem("orderDetails");
    if (!savedDetails) {
      navigate("/checkout/details");
      return;
    }
    setOrderDetails(JSON.parse(savedDetails));

    // If cart is empty, but NOT when already going to success
    if (snap.items.length === 0 && window.location.pathname !== "/checkout/success") {
      navigate("/cart");
    }
  }, [navigate, snap.items.length]);

  // Calculate totals based on all item types
  const subtotal = snap.items.reduce((sum, item) => {
    return sum + getItemTotal(item);
  }, 0);

  const shipping = 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!orderDetails) return;

    setIsProcessing(true);

    try {
      // Prepare order data with different item structures
      const orderData = {
        items: snap.items.map(item => {
          const baseItem = {
            id: item.id,
            type: item.type,
            quantity: item.quantity || 1,
            price: getItemPrice(item),
          };

          // Add type-specific fields
          switch (item.type) {
            case 'clothes':
              return {
                ...baseItem,
                selected_type: item.selected_type,
                selectedColor: item.selectedColor,
                selectedDecal: item.selectedDecal,
              };
            case 'sample':
              return {
                ...baseItem,
                name: item.name,
                artist: item.artist,
                genre: item.genre,
                bpm: item.bpm,
                key: item.key,
              };
            case 'pack':
              return {
                ...baseItem,
                name: item.name,
                artist: item.artist,
                description: item.description,
                sampleCount: item.sampleCount,
              };
            default:
              return baseItem;
          }
        }),
        orderDetails,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: orderDetails.paymentMethod,
      };

      console.log("📦 Creating order:", orderData);

      if (orderDetails.paymentMethod === "stripe") {
        // ============================================
        // STRIPE PAYMENT FLOW
        // ============================================
        
        console.log("💳 Processing Stripe payment...");
        
        // TODO: Call backend to create Stripe session
        // const response = await fetch('http://localhost:8080/api/checkout/create-session', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData),
        // });
        // const { checkoutUrl } = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo: redirect to success (in production, redirect to Stripe)
        // window.location.href = checkoutUrl;
        
        // For now, just go to success page
        console.log("✅ (Demo mode) Redirecting to success...");
        navigate("/checkout/success?session_id=demo_session");
        
      } else {
        // ============================================
        // CASH ON DELIVERY FLOW
        // ============================================
        
        console.log("💵 Processing cash on delivery order...");
        
        // TODO: Call backend to create order
        // const response = await fetch('http://localhost:8080/api/orders/cash', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData),
        // });
        // const result = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("✅ Cash on delivery order created");
        
        // Clear cart and redirect to success
        cartState.items = [];
        navigate("/checkout/success");
      }
      
    } catch (error) {
      console.error("❌ Order failed:", error);
      alert("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!orderDetails) {
    return <div className="loading-page">Loading...</div>;
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
                      ${itemTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
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
                <p className="detail-text">{orderDetails.address}</p>
                <p className="detail-text">
                  {orderDetails.city}, {orderDetails.state} {orderDetails.zipCode}
                </p>
                <p className="detail-text">{orderDetails.country}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="summary-card">
              <h3 className="summary-card-title">Payment Method</h3>
              <div className="payment-method-display">
                {orderDetails.paymentMethod === "stripe" ? (
                  <>
                    <span className="payment-icon-large">💳</span>
                    <div>
                      <p className="payment-method-name">Credit/Debit Card</p>
                      <p className="payment-method-desc">Stripe Payment</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="payment-icon-large">💵</span>
                    <div>
                      <p className="payment-method-name">Cash on Delivery</p>
                      <p className="payment-method-desc">Pay when delivered</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {orderDetails.notes && (
              <div className="summary-card">
                <h3 className="summary-card-title">Order Notes</h3>
                <p className="detail-text">{orderDetails.notes}</p>
              </div>
            )}

            {/* Price Summary */}
            <div className="summary-card price-summary">
              <h3 className="summary-card-title">Price Details</h3>
              <div className="price-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="price-divider" />
              <div className="price-row price-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
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
                  Processing...
                </>
              ) : (
                <>
                  {orderDetails.paymentMethod === "stripe" 
                    ? "💳 Continue to Stripe Payment" 
                    : "💵 Place Order (Cash on Delivery)"}
                </>
              )}
            </button>

            <p className="secure-badge">
              🔒 Your information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}