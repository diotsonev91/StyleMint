// PublicDesignsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clothDesignService } from "../../services/clothDesignService";
import { DesignPublicDTO, ClothType } from "../../api/clothDesign.api";
import {ClothItemPreview} from "../../components/three/previews/ClothItemPreview";
import "./PublicDesignsPage.css";
import {state} from "../../state";
import {addClothToCart} from "../../services/cartService";


const CLOTH_TYPE_LABELS: Record<ClothType, string> = {
    [ClothType.HOODIE]: "Hoodie",
    [ClothType.CAP]: "Cap",
    [ClothType.T_SHIRT_CLASSIC]: "Classic T-Shirt",
    [ClothType.T_SHIRT_SPORT]: "Sport T-Shirt",
    [ClothType.SHOE]: "Shoe",
};

const CLOTH_TYPE_ICONS: Record<ClothType, string> = {
    [ClothType.HOODIE]: "🧥",
    [ClothType.CAP]: "🧢",
    [ClothType.T_SHIRT_CLASSIC]: "👕",
    [ClothType.T_SHIRT_SPORT]: "👔",
    [ClothType.SHOE]: "👟",
};

export function PublicDesignsPage() {
    const [designs, setDesigns] = useState<DesignPublicDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDesign, setSelectedDesign] = useState<DesignPublicDTO | null>(null);
    const [rotationY, setRotationY] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedType, setSelectedType] = useState<ClothType | null>(null);
    const navigate = useNavigate();

    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchDesigns();
    }, [page, selectedType]);

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            let result;

            if (selectedType) {
                // Fetch designs by specific cloth type
                result = await clothDesignService.getDesignsByClothType(selectedType, page, PAGE_SIZE);
            } else {
                // Fetch all public designs
                result = await clothDesignService.getPublicDesigns(page, PAGE_SIZE);
            }

            if (result.success && result.data) {
                setDesigns(result.data.content);
                setTotalPages(result.data.totalPages);
                setHasMore(!result.data.last);
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

    const handleTypeFilter = (type: ClothType | null) => {
        setSelectedType(type);
        setPage(0); // Reset to first page when changing filter
    };

    const handleToggleLike = async (designId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const result = await clothDesignService.toggleLike(designId);

            if (result.success) {
                // Update local state
                setDesigns(designs.map(d => {
                    if (d.id === designId) {
                        const isCurrentlyLiked = d.isLikedByUser ?? false;
                        return {
                            ...d,
                            likesCount: isCurrentlyLiked
                                ? (d.likesCount ?? 0) - 1
                                : (d.likesCount ?? 0) + 1,
                            isLikedByUser: !isCurrentlyLiked
                        };
                    }
                    return d;
                }));

                // Update selected design if modal is open
                if (selectedDesign?.id === designId) {
                    const isCurrentlyLiked = selectedDesign.isLikedByUser ?? false;
                    setSelectedDesign({
                        ...selectedDesign,
                        likesCount: isCurrentlyLiked
                            ? (selectedDesign.likesCount ?? 0) - 1
                            : (selectedDesign.likesCount ?? 0) + 1,
                        isLikedByUser: !isCurrentlyLiked
                    });
                }
            } else {
                alert(result.error || "Failed to toggle like");
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to toggle like");
        }
    };

    const handleAddToCart = async (design: DesignPublicDTO) => {
        // Проверка дали потребителят е логнат (по избор)
        // Можете да проверите със session или да оставите на cartService да се справи

        // Проверка за наличие на customization data
        if (!design.customizationData) {
            alert("Cannot add this design to cart - missing customization data");
            return;
        }

        try {
            const customization = design.customizationData;
            const designName = design.label || CLOTH_TYPE_LABELS[design.clothType];

            // 1. Зареждане на design данните във Valtio state
            state.selectedColor = customization.selectedColor || "#ffffff";
            state.selectedDecal = customization.selectedDecal || "none";
            state.selected_type = design.clothType.toLowerCase();
            state.decalPosition = customization.decalPosition || [0, 0, 0];
            state.rotationY = customization.rotationY || 0;

            // Допълнителни свойства
            state.decals = customization.decals || [];
            state.colors = customization.colors || [];

            // Custom decal support
            if (customization.hasCustomDecal && design.customDecalUrl) {
                state.customDecal = {
                    file: null,
                    previewUrl: design.customDecalUrl
                };
            } else {
                state.customDecal = null;
            }

            // 2. Добавяне в количката чрез cartService
            await addClothToCart(design);

            // 3. Показване на успешно съобщение
            alert(`✅ "${designName}" added to cart!`);

        } catch (err) {
            console.error("Failed to add to cart:", err);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    const openPreview = (design: DesignPublicDTO) => {
        setSelectedDesign(design);
        setRotationY(0);
    };

    const closePreview = () => {
        setSelectedDesign(null);
    };

    const handleNextPage = () => {
        if (hasMore && page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    /**
     * Helper function to convert DesignPublicDTO to CartItem format
     */
    const designToCartItem = (design: DesignPublicDTO, tempRotation: number = 0) => {
        const customization = design.customizationData;

        return {
            id: design.id,
            type: "clothes" as const,

            selectedColor: customization.selectedColor || "#ffffff",
            selectedDecal: customization.selectedDecal || "none",

            selected_type: design.clothType.toLowerCase() as any,
            decalPosition: customization.decalPosition as [number, number, number] | null,

            rotationY: tempRotation,
            ripples: [],
            quantity: 1,

            hasCustomDecal: customization.hasCustomDecal ?? false,
            customDecalUrl: design.customDecalUrl ?? null,
        };
    };


    if (loading && page === 0) {
        return (
            <div className="public-designs-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading designs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-designs-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchDesigns} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="public-designs-page">
            <div className="page-header">
                <h1 className="page-title">🎨 Public Designs Gallery</h1>
                <button
                    onClick={() => navigate("/customizer")}
                    className="btn-create-new"
                >
                    ✨ Create Your Own
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="filter-section">
                <h3 className="filter-title">Filter by Type</h3>
                <div className="filter-buttons">
                    <button
                        onClick={() => handleTypeFilter(null)}
                        className={`filter-btn ${selectedType === null ? 'active' : ''}`}
                    >
                        🌟 All Types
                    </button>
                    {Object.values(ClothType).map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeFilter(type)}
                            className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                        >
                            {CLOTH_TYPE_ICONS[type]} {CLOTH_TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Filter Display */}
            {selectedType && (
                <div className="active-filter">
                    <span>
                        Showing: <strong>{CLOTH_TYPE_ICONS[selectedType]} {CLOTH_TYPE_LABELS[selectedType]}</strong>
                    </span>
                    <button
                        onClick={() => handleTypeFilter(null)}
                        className="clear-filter-btn"
                    >
                        ✕ Clear Filter
                    </button>
                </div>
            )}

            {designs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎨</div>
                    <h2>No designs found</h2>
                    <p>
                        {selectedType
                            ? `No ${CLOTH_TYPE_LABELS[selectedType]} designs available yet.`
                            : "Be the first to share your designs with the community!"
                        }
                    </p>
                    <button
                        onClick={() => navigate("/customizer")}
                        className="btn-primary"
                    >
                        Create Design
                    </button>
                </div>
            ) : (
                <>
                    <div className="designs-grid">
                        {designs.map((design) => {
                            const customization = design.customizationData
                            const isAdvancedMode = design.customizationType === "ADVANCED";

                            return (
                                <div key={design.id} className="design-card">
                                    {/* Mode Badge */}
                                    <div className="mode-badge">
                                        {isAdvancedMode ? "🎨 Advanced" : "✨ Easy"}
                                    </div>

                                    {/* Cloth Type Badge */}
                                    <div className="type-badge">
                                        {CLOTH_TYPE_ICONS[design.clothType]} {CLOTH_TYPE_LABELS[design.clothType]}
                                    </div>

                                    {/* 3D Preview */}
                                    <div
                                        className="design-preview"
                                        onClick={() => openPreview(design)}
                                    >
                                        <ClothItemPreview
                                            isAdvancedMode={isAdvancedMode}
                                            cartItem={designToCartItem(design)}
                                            tempRotationY={customization.rotationY ?? 0}
                                        />
                                        <div className="preview-overlay">
                                            <span>Click to preview</span>
                                        </div>
                                    </div>

                                    {/* Design Info */}
                                    <div className="design-info">
                                        <h3 className="design-name">
                                            {design.label || CLOTH_TYPE_LABELS[design.clothType]}
                                        </h3>

                                        <div className="design-details">
                                            {design.price && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Price:</span>
                                                    <span className="detail-value price">${design.price.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="design-stats">
                                            <span className="stat-item">
                                                ❤️ {design.likesCount || 0}
                                            </span>
                                            {design.salesCount !== undefined && (
                                                <span className="stat-item">
                                                    🛒 {design.salesCount || 0} sales
                                                </span>
                                            )}
                                        </div>

                                        <div className="design-date">
                                            Created: {new Date(design.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="design-actions">
                                        <button
                                            onClick={(e) => handleToggleLike(design.id, e)}
                                            className={`btn-action btn-like ${design.isLikedByUser ? 'liked' : ''}`}
                                            title={design.isLikedByUser ? "Unlike" : "Like"}
                                        >
                                            {design.isLikedByUser ? '❤️' : '🤍'} Like
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(design);
                                            }}
                                            className="btn-action btn-cart"
                                            title="Add to cart"
                                        >
                                            🛒 Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 0 || loading}
                                className="btn-page"
                            >
                                ← Previous
                            </button>

                            <span className="page-info">
                                Page {page + 1} of {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={!hasMore || loading}
                                className="btn-page"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            {selectedDesign && (
                <div className="preview-modal" onClick={closePreview}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closePreview}>
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2>{selectedDesign.label || CLOTH_TYPE_LABELS[selectedDesign.clothType]}</h2>
                            <div className="modal-badges">
                                <div className="modal-mode-badge">
                                    {selectedDesign.customizationType === "ADVANCED" ? "🎨 Advanced" : "✨ Easy"}
                                </div>
                                <div className="modal-type-badge">
                                    {CLOTH_TYPE_ICONS[selectedDesign.clothType]} {CLOTH_TYPE_LABELS[selectedDesign.clothType]}
                                </div>
                            </div>
                        </div>

                        <div className="modal-preview">
                            <ClothItemPreview
                                isAdvancedMode={selectedDesign.customizationType === "ADVANCED"}
                                cartItem={designToCartItem(selectedDesign, rotationY)}
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
                                        <span className="info-label">Type:</span>
                                        <span className="info-value">
                                            {CLOTH_TYPE_ICONS[selectedDesign.clothType]} {CLOTH_TYPE_LABELS[selectedDesign.clothType]}
                                        </span>
                                    </div>
                                    {selectedDesign.price && (
                                        <div className="info-item">
                                            <span className="info-label">Price:</span>
                                            <span className="info-value price">${selectedDesign.price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <span className="info-label">Likes:</span>
                                        <span className="info-value">❤️ {selectedDesign.likesCount || 0}</span>
                                    </div>
                                    {selectedDesign.salesCount !== undefined && (
                                        <div className="info-item">
                                            <span className="info-label">Sales:</span>
                                            <span className="info-value">🛒 {selectedDesign.salesCount || 0}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={(e) => handleToggleLike(selectedDesign.id, e)}
                                className={`btn-modal-action btn-like-full ${selectedDesign.isLikedByUser ? 'liked' : ''}`}
                            >
                                {selectedDesign.isLikedByUser ? '❤️ Liked' : '🤍 Like'}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}