import React from "react";
import "./LoginRequiredModal.css"; 

export const LoginRequiredModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-login">
      <div className="modal-content-login">
        <h2>Login Required</h2>
        <p>You need to log in to access advanced customization.</p>

        <div className="modal-buttons-login">
          <button onClick={onClose}>Close</button>
          <button
            className="primary-btn-login"
            onClick={() => (window.location.href = "/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};
