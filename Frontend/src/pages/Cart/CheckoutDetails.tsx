import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckoutDetails.css";

export type OrderDetails = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: "stripe" | "cash";
  notes?: string;
};

export function CheckoutDetails() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<OrderDetails>({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    paymentMethod: "stripe",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<OrderDetails>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderDetails> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save order details to localStorage
      localStorage.setItem("orderDetails", JSON.stringify(formData));
      
      // Navigate to order summary
      navigate("/checkout/summary");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof OrderDetails]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container-wide">
        <div className="checkout-header">
          <button onClick={() => navigate("/cart")} className="back-button">
            ← Back to Cart
          </button>
          <h1 className="checkout-title">Order Details</h1>
          <div className="checkout-steps">
            <div className="step active">1. Details</div>
            <div className="step-divider" />
            <div className="step">2. Summary</div>
            <div className="step-divider" />
            <div className="step">3. Payment</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Contact Information */}
          <div className="form-section">
            <h2 className="section-title">Contact Information</h2>
            
            <div className="form-group">
              <label className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="John Doe"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="form-section">
            <h2 className="section-title">Shipping Address</h2>
            
            <div className="form-group">
              <label className="form-label">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-input ${errors.address ? 'error' : ''}`}
                placeholder="123 Main Street, Apt 4B"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`form-input ${errors.city ? 'error' : ''}`}
                  placeholder="New York"
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`form-input ${errors.state ? 'error' : ''}`}
                  placeholder="NY"
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={`form-input ${errors.zipCode ? 'error' : ''}`}
                  placeholder="10001"
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h2 className="section-title">Payment Method</h2>
            
            <div className="payment-options">
              <label className={`payment-option ${formData.paymentMethod === 'stripe' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={formData.paymentMethod === 'stripe'}
                  onChange={handleInputChange}
                  className="payment-radio"
                />
                <div className="payment-option-content">
                  <div className="payment-option-header">
                    <span className="payment-icon">💳</span>
                    <span className="payment-title">Credit/Debit Card (Stripe)</span>
                  </div>
                  <p className="payment-description">
                    Pay securely with Stripe. Supports all major credit cards.
                  </p>
                </div>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                  className="payment-radio"
                />
                <div className="payment-option-content">
                  <div className="payment-option-header">
                    <span className="payment-icon">💵</span>
                    <span className="payment-title">Cash on Delivery</span>
                  </div>
                  <p className="payment-description">
                    Pay with cash when your order is delivered.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className="form-section">
            <h2 className="section-title">Order Notes (Optional)</h2>
            
            <div className="form-group">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any special instructions for your order..."
                rows={4}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="continue-button">
              Continue to Order Summary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}