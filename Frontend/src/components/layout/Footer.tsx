import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./Footer.css";

const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <h3 className="footer-logo">Style Mint</h3>
            <p className="footer-tagline">
              Custom fashion & exclusive samples for the new generation of creators.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Instagram" className="social-link">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" aria-label="TikTok" className="social-link">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="#" aria-label="YouTube" className="social-link">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="#" aria-label="Discord" className="social-link">
                <i className="fa-brands fa-discord"></i>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-section">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              <li><a href="#customizer">3D Customizer</a></li>
              <li><a href="#samples">Download Samples</a></li>
              <li><a href="#creator-zone">Creator Zone</a></li>
              <li><a href="#pseudo-nft">Pseudo-NFTs</a></li>
              <li><a href="#store">Store</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#shipping">Shipping & Returns</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section newsletter-section">
            <h4 className="footer-heading">Stay in the Loop</h4>
            <p className="newsletter-text">
              Join our creative tribe. Get fresh drops, free samples, and exclusive perks.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">Join</button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2025 Style Mint — React × Spring Boot. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
