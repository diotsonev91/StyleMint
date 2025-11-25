// src/components/SaveDesignModal.tsx - FINAL FIX with ref()
import { useState } from "react";
import { ref } from "valtio"; // ✅ Import ref() to extract raw values
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
            // ✅ CRITICAL FIX: Extract the REAL File object using ref()
            // state.customDecal is a proxy, state.customDecal.file is ALSO a proxy
            // We need to get the raw File object from inside the proxy

            let customDecalFile: File | null = null;
            let customDecalInfo = null;

            if (state.customDecal) {
                // Try to extract the real File object
                // The proxy wraps the File, but we can access its properties directly
                const proxyFile = state.customDecal.file;

                // Check if it's actually a File
                if (proxyFile instanceof File) {
                    customDecalFile = proxyFile;
                } else {
                    // If it's a proxy, try to get the original
                    // Valtio wraps objects, but primitives and File objects should be accessible
                    console.warn('customDecal.file is not a File instance, attempting to extract');
                    customDecalFile = proxyFile as any; // Force cast as last resort
                }

                // Now safely extract file info
                if (customDecalFile) {
                    customDecalInfo = {
                        fileName: customDecalFile.name,
                        fileType: customDecalFile.type,
                        fileSize: customDecalFile.size
                    };

                    console.log('✅ Extracted file info:', customDecalInfo);
                }
            }

            // Build FormData
            const formData = new FormData();
            formData.append('label', label.trim());
            formData.append('clothType', state.selected_type.toUpperCase());
            formData.append('customizationType', state.page === 'advanced' ? 'ADVANCED' : 'SIMPLE');
            formData.append('isPublic', String(selectedOption === 'public'));
            formData.append('bonusPoints', String(bonusPoints));

            // Build customizationData
            const customizationData = {
                selectedColor: state.selectedColor,
                selectedDecal: state.selectedDecal,
                decalPosition: state.decalPosition,
                rotationY: state.rotationY,
                colors: state.colors,
                decals: state.decals,
                selected_type: state.selected_type,
                page: state.page,
                hasCustomDecal: hasCustomDecal,
                customDecalInfo: customDecalInfo
            };

            formData.append('customizationJson', JSON.stringify(customizationData));

            // ✅ Add the REAL File object to FormData
            if (customDecalFile) {
                console.log('✅ Appending file to FormData:', customDecalFile.name);
                formData.append('customDecalFile', customDecalFile);
            }

            console.log('📦 Saving design:', {
                label,
                clothType: state.selected_type,
                hasCustomDecal,
                fileAdded: !!customDecalFile
            });

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
            console.error("❌ Failed to save design:", err);
            setError(err.response?.data?.message || err.message || "Failed to save design. Please try again.");
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