import React, { useState, useContext } from "react";
import { login as apiLogin } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiLogin(email, password);
      login(data.token);
      alert("Logged in successfully!");
      window.location.href = "/";
    } catch {
      alert("Login failed. Check credentials or backend connection.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-auth">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
