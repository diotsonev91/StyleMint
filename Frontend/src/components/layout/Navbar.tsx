import React from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Link to="/">
                    <img
                        src={logo}
                        alt="StyleMint logo"
                        width={140}
                        height={120}
                        className="logo"
                    />
                </Link>
            </div>

            <div className="nav-links">
                {/* Always visible */}
                <Link to="/">Home</Link>
                <Link to="/prices">Prices</Link>

                {!user ? (
                    <>
                        {/* NOT LOGGED IN */}
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="register-btn">Register</Link>
                    </>
                ) : (
                    <>
                        {/* LOGGED IN */}
                        <Link to="/games">Games</Link>
                        <Link to="/catalogue">Catalogue</Link>
                        <Link to="/sounds">Sounds</Link>
                        <Link to="/profile">Profile</Link>
                        <Link to="/cart">Cart</Link>
                        <Link to="/my-nfts">My NFTs</Link>

                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}

                {/* Theme toggle */}
                <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                    {theme === "light" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
}
