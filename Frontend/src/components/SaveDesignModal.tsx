// src/components/SaveDesignModal.tsx
import { useState } from "react";
import { snapshot } from "valtio";
import { state } from "../state";
import { clothDesignApi } from "../api/clothDesign.api";
import { useAuth } from "../hooks/useAuth";
import "./SaveDesignModal.css";

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
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<"personal" | "public">("personal");
    const { user } = useAuth();

    // Login check
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

    // Calculate bonus points
    const hasCustomDecal = !!state.customDecal;
    const bonusPoints = hasCustomDecal ? 100 : 20;

    const handleSave = async () => {
        if (!label.trim()) {
            setError("Please enter a name for your design");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const snap = snapshot(state);

            // Build FormData
            const formData = new FormData();
            formData.append('label', label.trim());
            formData.append('clothType', snap.selected_type.toUpperCase());
            formData.append('customizationType', snap.page === 'advanced' ? 'ADVANCED' : 'SIMPLE');
            formData.append('isPublic', String(selectedOption === 'public'));
            formData.append('bonusPoints', String(bonusPoints));

            // Pack customization data
            const customizationData = {
                selectedColor: snap.selectedColor,
                selectedDecal: snap.selectedDecal,
                decalPosition: snap.decalPosition,
                rotationY: snap.rotationY,
                colors: snap.colors,
                decals: snap.decals,
                selected_type: snap.selected_type,
                page: snap.page,
                hasCustomDecal: hasCustomDecal,
                customDecalInfo: snap.customDecal ? {
                    fileName: snap.customDecal.file.name,
                    fileType: snap.customDecal.file.type,
                    fileSize: snap.customDecal.file.size
                } : null
            };

            formData.append('customizationJson', JSON.stringify(customizationData));

            // Add custom decal file if exists
            if (snap.customDecal?.file) {
                formData.append('customDecalFile', snap.customDecal.file);
            }

            // Save to backend
            const response = await clothDesignApi.saveDesign(formData);

            if (response.success && response.data) {
                onSaveSuccess(response.data);
                onClose();

                // Reset form
                setLabel("");
                setSelectedOption("personal");

                // Show success message
                if (selectedOption === "public") {
                    alert(`🎉 Design saved and published! You earned ${bonusPoints} bonus points!`);
                } else {
                    alert("✅ Design saved for personal use!");
                }
            } else {
                setError(response.message || 'Failed to save design');
            }
        } catch (err: any) {
            console.error("Failed to save design:", err);
            setError(err.response?.data?.message || "Failed to save design. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Save Your Style</h2>

                {error && <div className="error-message-design-modal">{error}</div>}

                <div className="modal-input-group">
                    <label htmlFor="design-label">Design Name:</label>
                    <input
                        id="design-label"
                        type="text"
                        placeholder="Enter a name for your design"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />
                </div>

                <div className="save-options">
                    <div
                        className={`option-card ${selectedOption === "personal" ? "selected" : ""}`}
                        onClick={() => !isSubmitting && setSelectedOption("personal")}
                    >
                        <div className="option-header">
                            <h3>Save for Personal Use</h3>
                            <input
                                type="radio"
                                checked={selectedOption === "personal"}
                                onChange={() => setSelectedOption("personal")}
                                disabled={isSubmitting}
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
                        onClick={() => !isSubmitting && setSelectedOption("public")}
                    >
                        <div className="option-header">
                            <h3>Make it Public + Earn Points</h3>
                            <input
                                type="radio"
                                checked={selectedOption === "public"}
                                onChange={() => setSelectedOption("public")}
                                disabled={isSubmitting}
                            />
                        </div>
                        <p>Share your design with the community and earn rewards</p>
                        <ul>
                            <li>✓ <strong>{bonusPoints} BONUS POINTS</strong> immediately</li>
                            <li>✓ Featured in marketplace</li>
                            <li>✓ Others can purchase your design</li>
                            <li>✓ Earn royalties on sales</li>
                        </ul>

                        {/* Design info */}
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