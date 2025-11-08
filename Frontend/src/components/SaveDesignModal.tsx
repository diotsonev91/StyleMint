// src/components/SaveDesignModal.tsx
import { useState } from "react";
import { state } from "../state";
import { saveDesign } from "../services/clothDesignService";
import { useAuth } from "../hooks/useAuth";
import "./SaveDesignModal.css"

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (design: any) => void;
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"personal" | "public">("personal");
  const { user } = useAuth();

 if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Login Required</h2>
          <p>You need to be logged in to save your designs.</p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn-save"
              onClick={() => {
                onClose();
                // Пренасочване към login страница
                window.location.href = "/login";
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  // Пресмятане на бонус точки
  const hasCustomDecal = state.selectedDecal.startsWith("custom");
  const bonusPoints = hasCustomDecal ? 100 : 20;

  const handleSave = async () => {
    if (!label.trim()) {
      alert("Please enter a name for your design");
      return;
    }

    setIsSubmitting(true);
    try {
      const design = await saveDesign(
        state,
        label.trim(),
        selectedOption === "public", // isPublic
        bonusPoints
      );

      onSaveSuccess(design);
      onClose();
      setLabel("");
      
      // Покажи съобщение с бонус точки
      if (selectedOption === "public") {
        alert(`🎉 Design saved and published! You earned ${bonusPoints} bonus points!`);
      } else {
        alert("✅ Design saved for personal use!");
      }
    } catch (error) {
      console.error("Failed to save design:", error);
      alert("Failed to save design. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Save Your Style</h2>
        
        <div className="modal-input-group">
          <label htmlFor="design-label">Design Name:</label>
          <input
            id="design-label"
            type="text"
            placeholder="Enter a name for your design"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="save-options">
          <div 
            className={`option-card ${selectedOption === "personal" ? "selected" : ""}`}
            onClick={() => setSelectedOption("personal")}
          >
            <div className="option-header">
              <h3>Save for Personal Use</h3>
              <input 
                type="radio" 
                checked={selectedOption === "personal"}
                onChange={() => setSelectedOption("personal")}
              />
            </div>
            <p>Save this design to your personal collection for future use</p>
            <ul>
              <li>✓ Private to your account</li>
              <li>✓ Reuse in future projects</li>
              <li>✓ Edit anytime</li>
            </ul>
          </div>

          <div 
            className={`option-card ${selectedOption === "public" ? "selected" : ""}`}
            onClick={() => setSelectedOption("public")}
          >
            <div className="option-header">
              <h3>Make it Public + Earn Points</h3>
              <input 
                type="radio" 
                checked={selectedOption === "public"}
                onChange={() => setSelectedOption("public")}
              />
            </div>
            <p>Share your design with the community and earn rewards</p>
            <ul>
              <li>✓ <strong>{bonusPoints} BONUS POINTS</strong> immediately</li>
              <li>✓ Featured in marketplace</li>
              <li>✓ Others can purchase your design</li>
              <li>✓ Earn royalties on sales</li>
            </ul>
            
            {/* Информация за типа на дизайна */}
            <div className="design-info">
              <p><strong>Design type:</strong> {hasCustomDecal ? "Custom Image" : "Pre-made Decals"}</p>
              <p><strong>Bonus points:</strong> {hasCustomDecal ? "100 (custom image)" : "20 (pre-made decals)"}</p>
            </div>
            
            <div className="bonus-badge">
              🎁 +{bonusPoints} Points
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={isSubmitting || !label.trim()}
          >
            {isSubmitting ? "Saving..." : "Save Design"}
          </button>
        </div>
      </div>
    </div>
  );
};