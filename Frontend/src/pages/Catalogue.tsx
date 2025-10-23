// Catalogue.tsx
import { useState } from "react";
import "./catalogue.css";

const products = [
  {
    id: 1,
    name: "Classic Tee",
    price: "29.99",
    image: "/images/classic_tee.png",
    category: "T-Shirts",
  },
  {
    id: 2,
    name: "Hoodie Supreme",
    price: "49.99",
    image: "/images/hoodie_black.png",
    category: "Hoodies",
  },
  {
    id: 3,
    name: "Mint Cap",
    price: "19.99",
    image: "/images/cap_green.png",
    category: "Accessories",
  },
  {
    id: 4,
    name: "Sport Edition Tee",
    price: "34.99",
    image: "/images/shirt_sport.png",
    category: "T-Shirts",
  },
  {
    id: 5,
    name: "Sneakers",
    price: "89.99",
    image: "/images/sneakers.png",
    category: "Footwear",
  },
];

export default function Catalogue() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="catalogue-page">
      {/* Animated Background */}
      <div className="catalogue-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className="catalogue-header">
        <div className="header-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>New Collection</span>
        </div>
        <h1 className="catalogue-title">
          Explore the <span className="gradient-text">StyleMint</span> Collection
        </h1>
        <p className="catalogue-subtitle">
          Choose your base — customize it your way. Express yourself.
        </p>
      </header>

      {/* Products Grid */}
      <div className="catalogue-grid">
        {products.map((item, index) => (
          <div 
            className="product-card" 
            key={item.id}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Category Badge */}
            <div className="product-badge">{item.category}</div>

            {/* Image Container */}
            <div className="product-image-container">
              <div className="product-image-wrapper">
                <img src={item.image} alt={item.name} />
                <div className="image-overlay">
                  <button 
                    className="quick-view-btn"
                    onClick={() => openModal(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Quick View
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-details">
                <h2 className="product-name">{item.name}</h2>
                <div className="product-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{item.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <button className="customize-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Customize Now
                </button>
              </div>
            </div>

            {/* Shine Effect */}
            <div className="card-shine"></div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="modal-close" onClick={closeModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="modal-grid">
              {/* Image Section */}
              <div className="modal-image-section">
                <div className="modal-badge">{selectedProduct.category}</div>
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="modal-image"
                />
              </div>

              {/* Info Section */}
              <div className="modal-info-section">
                <h2 className="modal-product-name">{selectedProduct.name}</h2>
                <div className="modal-product-price">
                  <span className="modal-price-currency">$</span>
                  <span className="modal-price-amount">{selectedProduct.price}</span>
                </div>

                <div className="modal-divider"></div>

                <div className="modal-description">
                  <h3>Product Description</h3>
                  <p>
                    Premium quality {selectedProduct.category.toLowerCase()} made with the finest materials. 
                    Perfect for everyday wear and built to last. Customize it to match your unique style.
                  </p>
                </div>

                <div className="modal-features">
                  <h3>Features</h3>
                  <ul>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Premium Quality Materials
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Customizable Design
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Fast Shipping
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Satisfaction Guaranteed
                    </li>
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="modal-customize-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Customize Now
                  </button>
                  <button className="modal-wishlist-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="fab" aria-label="Filter products">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>
  );
}