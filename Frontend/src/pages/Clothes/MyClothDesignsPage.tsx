// MyClothDesignsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clothDesignService } from "../../services/clothDesignService";
import { DesignDetailDTO } from "../../api/clothDesign.api";
import "./MyClothDesignsPage.css";
import { ClothItemPreview } from "../../components/three/previews/ClothItemPreview";

interface MyClothDesignsPageProps {
    userId?: string; // ✅ Optional - defaults to current user
    isEmbedded?: boolean; // ✅ Optional - for embedding in profile
    onClose?: () => void; // ✅ Optional - close callback for embedded mode
}

export function MyClothDesignsPage({
                                       userId,
                                       isEmbedded = false,
                                       onClose
                                   }: MyClothDesignsPageProps = {}) {
    const [designs, setDesigns] = useState<DesignDetailDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDesign, setSelectedDesign] = useState<DesignDetailDTO | null>(null);
    const [rotationY, setRotationY] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyDesigns();
    }, [userId]); // ✅ Re-fetch if userId changes

    const fetchMyDesigns = async () => {
        try {
            setLoading(true);

            // ✅ Use userId if provided, otherwise get current user's designs
            const result = userId
                ? await clothDesignService.getUserDesignsById(userId)
                : await clothDesignService.getUserDesigns();

            if (result.success && result.data) {
                setDesigns(result.data);
                setError(null);
            } else {
                setError(result.error || "Failed to fetch designs");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (designId: string) => {
        // ✅ In embedded mode or viewing other user's designs, disable delete
        if (isEmbedded || userId) {
            alert("Cannot delete designs in view mode");
            return;
        }

        if (!confirm("Are you sure you want to delete this design?")) {
            return;
        }

        try {
            const result = await clothDesignService.deleteDesign(designId);

            if (result.success) {
                // Remove from local state
                setDesigns(designs.filter(d => d.id !== designId));

                // Close modal if this design was selected
                if (selectedDesign?.id === designId) {
                    setSelectedDesign(null);
                }
            } else {
                alert(result.error || "Failed to delete design");
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete design");
        }
    };

    const handleEdit = (design: DesignDetailDTO) => {
        // ✅ In embedded mode or viewing other user's designs, disable edit
        if (isEmbedded || userId) {
            alert("Cannot edit designs in view mode");
            return;
        }

        // Navigate to dedicated edit page
        navigate(`/edit-design?id=${design.id}`);
    };

    const handleAddToCart = async (design: DesignDetailDTO) => {
        // TODO: Implement add to cart functionality
        alert("Add to cart functionality coming soon!");
    };

    const openPreview = (design: DesignDetailDTO) => {
        if (!design.customizationData) {
            console.error(`Cannot preview design ${design.id} - missing customizationData`);
            alert("Cannot preview this design - missing data");
            return;
        }
        setSelectedDesign(design);
        setRotationY(design.customizationData.rotationY ?? 0);
    };

    const closePreview = () => {
        setSelectedDesign(null);
    };

    // ✅ Determine if we're in view-only mode
    const isViewOnly = isEmbedded || !!userId;

    if (loading) {
        return (
            <div className={`my-designs-page ${isEmbedded ? 'embedded' : ''}`}>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading designs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`my-designs-page ${isEmbedded ? 'embedded' : ''}`}>
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchMyDesigns} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`my-designs-page ${isEmbedded ? 'embedded' : ''}`}>
            {/* ✅ Embedded Header */}
            {isEmbedded && (
                <div className="embedded-header">
                    {onClose && (
                        <button onClick={onClose} className="close-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <h2 className="embedded-title">
                        {userId ? "User Designs" : "My Designs"}
                    </h2>
                </div>
            )}

            {/* ✅ Regular Header (only show in non-embedded mode) */}
            {!isEmbedded && (
                <div className="page-header">
                    <h1 className="page-title">
                        {userId ? "User Designs" : "My Cloth Designs"}
                    </h1>
                    {!isViewOnly && (
                        <button
                            onClick={() => navigate("/customizer")}
                            className="btn-create-new"
                        >
                            ✨ Create New Design
                        </button>
                    )}
                </div>
            )}

            {designs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎨</div>
                    <h2>No designs yet</h2>
                    <p>
                        {isViewOnly
                            ? "This user hasn't created any designs yet"
                            : "Start creating your custom clothing designs!"
                        }
                    </p>
                    {!isViewOnly && (
                        <button
                            onClick={() => navigate("/customizer")}
                            className="btn-primary"
                        >
                            Create Your First Design
                        </button>
                    )}
                </div>
            ) : (
                <div className={`designs-grid ${isEmbedded ? 'embedded-grid' : ''}`}>
                    {designs.map((design) => {
                        // Safety check - skip designs without customization data
                        if (!design.customizationData) {
                            console.warn(`Design ${design.id} missing customizationData`);
                            return null;
                        }

                        const customization = design.customizationData;
                        const isAdvancedMode = customization.page === "advanced";

                        return (
                            <div key={design.id} className="design-card">
                                {/* Mode Badge */}
                                <div className="mode-badge">
                                    {isAdvancedMode ? "🎨 Advanced" : "✨ Easy"}
                                </div>

                                {/* Preview */}
                                <div
                                    className="design-preview"
                                    onClick={() => openPreview(design)}
                                >
                                    <ClothItemPreview
                                        isAdvancedMode={isAdvancedMode}
                                        cartItem={{
                                            id: design.id,
                                            type: "clothes" as const,
                                            selectedColor: customization.selectedColor,
                                            selectedDecal: customization.selectedDecal,
                                            selected_type: design.clothType.toLowerCase() as any,
                                            decalPosition: customization.decalPosition as [number, number, number] | null,
                                            rotationY: customization.rotationY ?? 0,
                                            ripples: [],
                                            quantity: 1,
                                        }}
                                        tempRotationY={customization.rotationY ?? 0}
                                    />
                                    <div className="preview-overlay">
                                        <span>Click to preview</span>
                                    </div>
                                </div>

                                {/* Design Info */}
                                <div className="design-info">
                                    <h3 className="design-name">
                                        {design.clothType.replace(/_/g, ' ').toUpperCase()}
                                    </h3>

                                    <div className="design-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Decal:</span>
                                            <span className="detail-value">{customization.selectedDecal}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Color:</span>
                                            <div className="color-info">
                                                <div
                                                    className="color-dot"
                                                    style={{ backgroundColor: customization.selectedColor }}
                                                />
                                                <span className="detail-value">{customization.selectedColor}</span>
                                            </div>
                                        </div>
                                        {isAdvancedMode && customization.decalPosition && (
                                            <div className="detail-row">
                                                <span className="detail-label">Mode:</span>
                                                <span className="detail-value">Advanced positioning</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="design-date">
                                        Created: {new Date(design.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* ✅ Conditional Actions based on mode */}
                                <div className="design-actions">
                                    {!isViewOnly ? (
                                        // ✅ Full actions for owner
                                        <>
                                            <button
                                                onClick={() => handleEdit(design)}
                                                className="btn-action btn-edit"
                                                title="Edit design"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(design)}
                                                className="btn-action btn-cart"
                                                title="Add to cart"
                                            >
                                                🛒 Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleDelete(design.id)}
                                                className="btn-action btn-delete"
                                                title="Delete design"
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    ) : (
                                        // ✅ View-only actions for others
                                        <>
                                            <button
                                                onClick={() => openPreview(design)}
                                                className="btn-action btn-preview"
                                                title="Preview design"
                                            >
                                                👁️ Preview
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(design)}
                                                className="btn-action btn-cart"
                                                title="Add to cart"
                                            >
                                                🛒 Add to Cart
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview Modal */}
            {selectedDesign && (
                <div className="preview-modal" onClick={closePreview}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closePreview}>
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2>{selectedDesign.clothType.replace(/_/g, ' ').toUpperCase()}</h2>
                            <div className="modal-mode-badge">
                                {selectedDesign.customizationData.page === "advanced" ? "🎨 Advanced" : "✨ Easy"}
                            </div>
                        </div>

                        <div className="modal-preview">
                            <ClothItemPreview
                                isAdvancedMode={selectedDesign.customizationData.page === "advanced"}
                                cartItem={{
                                    id: selectedDesign.id,
                                    type: "clothes" as const,
                                    selectedColor: selectedDesign.customizationData.selectedColor,
                                    selectedDecal: selectedDesign.customizationData.selectedDecal,
                                    selected_type: selectedDesign.clothType.toLowerCase() as any,
                                    decalPosition: selectedDesign.customizationData.decalPosition as [number, number, number] | null,
                                    rotationY: rotationY,
                                    ripples: [],
                                    quantity: 1,
                                }}
                                tempRotationY={rotationY}
                            />
                        </div>

                        <div className="modal-rotation">
                            <label className="rotation-label">
                                Rotation: {Math.round(rotationY)}°
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={rotationY}
                                onChange={(e) => setRotationY(+e.target.value)}
                                className="rotation-slider"
                            />
                        </div>

                        <div className="modal-info">
                            <div className="info-section">
                                <h4>Details</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Decal:</span>
                                        <span className="info-value">{selectedDesign.customizationData.selectedDecal}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Color:</span>
                                        <div className="color-info">
                                            <div
                                                className="color-dot"
                                                style={{ backgroundColor: selectedDesign.customizationData.selectedColor }}
                                            />
                                            <span className="info-value">{selectedDesign.customizationData.selectedColor}</span>
                                        </div>
                                    </div>
                                    {selectedDesign.customizationData.decalPosition && (
                                        <>
                                            <div className="info-item">
                                                <span className="info-label">Position:</span>
                                                <span className="info-value">Custom</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Mode:</span>
                                                <span className="info-value">Advanced</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {!isViewOnly ? (
                                // ✅ Full actions for owner
                                <>
                                    <button
                                        onClick={() => {
                                            closePreview();
                                            handleEdit(selectedDesign);
                                        }}
                                        className="btn-modal-action btn-edit-full"
                                    >
                                        ✏️ Edit Design
                                    </button>
                                    <button
                                        onClick={() => {
                                            closePreview();
                                            handleAddToCart(selectedDesign);
                                        }}
                                        className="btn-modal-action btn-cart-full"
                                    >
                                        🛒 Add to Cart
                                    </button>
                                </>
                            ) : (
                                // ✅ View-only actions for others
                                <button
                                    onClick={() => {
                                        closePreview();
                                        handleAddToCart(selectedDesign);
                                    }}
                                    className="btn-modal-action btn-cart-full"
                                >
                                    🛒 Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}