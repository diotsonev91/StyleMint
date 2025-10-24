import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">StyleMint</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/sounds">Sounds</Link>
        <Link to="/customize">Customizer</Link>
        <Link to="/catalogue">Catalogue</Link>
        <Link to="/game">GameMint</Link>
        <Link to="/profile">Profile</Link>
        {user ? (
          <>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
