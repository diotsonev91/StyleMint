import React from 'react';
import "./ConfirmationModal.css"

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  confirmButtonStyle?: React.CSSProperties;
  variant?: 'danger' | 'warning' | 'success' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
  confirmButtonStyle = {},
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  // Variant-based styles
  const variantStyles = {
    danger: { backgroundColor: '#dc3545' },
    warning: { backgroundColor: '#ffc107', color: '#000' },
    success: { backgroundColor: '#28a745' },
    info: { backgroundColor: '#17a2b8' },
  };

  const defaultConfirmStyle = {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    opacity: isProcessing ? 0.6 : 1,
    ...variantStyles[variant],
    ...confirmButtonStyle,
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h3 className="confirmation-modal-title">{title}</h3>
        <div className="confirmation-modal-message">{message}</div>
        <div className="confirmation-modal-actions">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="confirmation-modal-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={defaultConfirmStyle}
            className="confirmation-modal-confirm-btn"
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;