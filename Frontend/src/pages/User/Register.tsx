import React, { useState } from "react";
import { register } from "../../api/auth";
import "./Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      alert("Registration successful! Please log in.");
      window.location.href = "/login";
    } catch (err) {
      alert("Error creating account. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account 🧵</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-auth">Register</button>
        </form>
      </div>
    </div>
  );
}
