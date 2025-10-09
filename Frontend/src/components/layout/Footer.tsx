import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "./Footer.css";

const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2025 Style Mint — React × Spring Boot × Solana</p>
        <button onClick={toggleTheme} className="theme-btn">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
