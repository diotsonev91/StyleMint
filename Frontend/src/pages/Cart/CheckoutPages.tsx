
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./CheckoutPages.css";

// =====================================================
// CheckoutSuccess - Success page after order completion
// =====================================================

export function CheckoutSuccess() {
    console.log("✅ SUCCESS PAGE RENDERED");

  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cash" | null>(null);

  const sessionId = searchParams.get("session_id"); // Only present for Stripe

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        // Get order details from localStorage
        const savedDetails = localStorage.getItem("orderDetails");
        if (savedDetails) {
          const details = JSON.parse(savedDetails);
          setPaymentMethod(details.paymentMethod);
          setOrderDetails(details);
        }

        // Only verify Stripe payment if session_id exists
        if (sessionId) {
          // This means user came from Stripe
          console.log("✅ Stripe payment completed");
          
          // TODO: Verify payment with backend
          // const orderId = localStorage.getItem("pendingOrderId");
          // await verifyStripePayment(orderId);
        } else {
          // Cash on delivery - order already created
          console.log("✅ Cash on delivery order placed");
        }

        // Clear stored data (already processed)
        // Don't clear immediately - we need it for display
        // localStorage.removeItem("orderDetails");
        
      } catch (error) {
        console.error("Error loading order details:", error);
      }
    }

    loadOrderDetails();
  }, [sessionId]);

  if (!orderDetails) {
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

        <h1 className="success-title">Order Confirmed! 🎉</h1>
        <p className="success-subtitle">
          {paymentMethod === "stripe" 
            ? "Thank you for your payment!" 
            : "Thank you for your order!"}
        </p>

        {/* Order Details */}
        <div className="order-details">
          <h3 className="order-details-title">Order Details</h3>
          <div>
            <div className="order-detail-row">
              <span className="order-detail-label">Name:</span>
              <span className="order-detail-value">{orderDetails.fullName}</span>
            </div>
            <div className="order-detail-row">
              <span className="order-detail-label">Email:</span>
              <span className="order-detail-value">{orderDetails.email}</span>
            </div>
            <div className="order-detail-row">
              <span className="order-detail-label">Delivery Address:</span>
              <span className="order-detail-value">
                {orderDetails.address}, {orderDetails.city}, {orderDetails.state} {orderDetails.zipCode}
              </span>
            </div>
            <div className="order-detail-row">
              <span className="order-detail-label">Payment Method:</span>
              <span className="order-detail-value">
                {paymentMethod === "stripe" ? "💳 Credit Card (Stripe)" : "💵 Cash on Delivery"}
              </span>
            </div>
            {orderDetails.notes && (
              <div className="order-detail-row">
                <span className="order-detail-label">Notes:</span>
                <span className="order-detail-value">{orderDetails.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Messages - Different for Stripe vs Cash */}
        <div className="info-messages">
          <p className="info-message">
            <span>📧</span>
            <span>A confirmation email has been sent to {orderDetails.email}</span>
          </p>
          <p className="info-message">
            <span>🎨</span>
            <span>Your custom items are now being prepared!</span>
          </p>
          {paymentMethod === "cash" && (
            <p className="info-message">
              <span>💵</span>
              <span>Please have cash ready when your order is delivered</span>
            </p>
          )}
        </div>

        {/* Payment Status Box */}
        <div className={`payment-status-box ${paymentMethod === "stripe" ? "paid" : "pending"}`}>
          {paymentMethod === "stripe" ? (
            <>
              <div className="status-icon">✓</div>
              <div>
                <div className="status-title">Payment Confirmed</div>
                <div className="status-desc">Your payment has been processed successfully</div>
              </div>
            </>
          ) : (
            <>
              <div className="status-icon">⏳</div>
              <div>
                <div className="status-title">Payment Pending</div>
                <div className="status-desc">Pay cash when your order is delivered</div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="checkout-buttons">
          <Link to="/" className="checkout-btn checkout-btn-primary">
            Continue Shopping
          </Link>
          <Link to="/orders" className="checkout-btn checkout-btn-secondary">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CheckoutCancel - Cancel page when user cancels (Stripe only)
// =====================================================

export function CheckoutCancel() {
  useEffect(() => {
    console.log("❌ Payment cancelled by user");
  }, []);

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