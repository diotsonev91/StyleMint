// src/components/clothes/DesignCardSmall.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DesignCardSmall.css';
import {ClothItemPreview} from "../previews/ClothItemPreview";
import {ClothType, DesignPublicDTO} from "../../../api/clothDesign.api";
import { clothDesignService } from '../../../services/clothDesignService';

interface DesignCardSmallProps {
    design: DesignPublicDTO;
    isLoggedIn: boolean;
}

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

const DesignCardSmall: React.FC<DesignCardSmallProps> = ({ design, isLoggedIn }) => {
    const navigate = useNavigate();
    const [showPreview, setShowPreview] = useState(false);
    const [rotationY, setRotationY] = useState(design.customizationData?.rotationY || 0);
    const [localDesign, setLocalDesign] = useState<DesignPublicDTO>(design);

    const handleClick = () => {
        if (isLoggedIn) {
            setShowPreview(true);
        }
    };

    const designToCartItem = (design: DesignPublicDTO) => {
        const customization = design.customizationData;

        return {
            id: design.id,
            type: "clothes" as const,
            selectedColor: customization?.selectedColor || "#ffffff",
            selectedDecal: customization?.selectedDecal || "none",
            selected_type: design.clothType.toLowerCase() as any,
            decalPosition: customization?.decalPosition as [number, number, number] | null,
            rotationY: rotationY,
            ripples: [],
            quantity: 1,
            hasCustomDecal: customization?.hasCustomDecal ?? false,
            customDecalUrl: design.customDecalUrl ?? null,
        };
    };

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            alert("Please login to like designs");
            return;
        }

        try {
            const result = await clothDesignService.toggleLike(localDesign.id);

            if (result.success) {
                // Update local state
                const isCurrentlyLiked = localDesign.isLikedByUser ?? false;
                setLocalDesign({
                    ...localDesign,
                    likesCount: isCurrentlyLiked
                        ? (localDesign.likesCount ?? 0) - 1
                        : (localDesign.likesCount ?? 0) + 1,
                    isLikedByUser: !isCurrentlyLiked
                });
            } else {
                alert(result.error || "Failed to toggle like");
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to toggle like");
        }
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            alert("Please login to add items to cart");
            return;
        }

        // TODO: Implement add to cart functionality
        alert("Add to cart functionality coming soon!");
        setShowPreview(false);
    };

    const handleViewFullPage = () => {
        navigate('/catalogue');
    };

    const formatLikes = (count: number): string => {
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
        return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
    };

    const isAdvancedMode = localDesign.customizationType === "ADVANCED";

    return (
        <>
            <div
                className={`design-card-small ${!isLoggedIn ? 'disabled' : ''}`}
                onClick={handleClick}
            >
                <div className="design-card-preview">
                    <ClothItemPreview
                        isAdvancedMode={isAdvancedMode}
                        cartItem={designToCartItem(localDesign)}
                        tempRotationY={localDesign.customizationData?.rotationY ?? 0}
                    />
                    <div className="design-card-overlay">
                        {!isLoggedIn && (
                            <div className="login-required-badge">
                                🔒 Login to view
                            </div>
                        )}
                    </div>
                </div>

                <div className="design-card-content">
                    {/* Type Badge */}
                    <div className="design-type-badge">
                        {CLOTH_TYPE_ICONS[localDesign.clothType]} {CLOTH_TYPE_LABELS[localDesign.clothType]}
                    </div>

                    <h3 className="design-card-title">
                        {localDesign.label || CLOTH_TYPE_LABELS[localDesign.clothType]}
                    </h3>

                    <div className="design-card-meta">
                        <span className="design-likes">
                            ❤️ {formatLikes(localDesign.likesCount || 0)}
                        </span>
                        {localDesign.price && (
                            <span className="design-price">${localDesign.price.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="design-card-footer">
                        {isLoggedIn ? (
                            <button className="design-card-btn">View Design</button>
                        ) : (
                            <button className="design-card-btn disabled" disabled>
                                Login Required
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && isLoggedIn && (
                <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
                    <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowPreview(false)}>
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2 className="modal-title">
                                {localDesign.label || CLOTH_TYPE_LABELS[localDesign.clothType]}
                            </h2>
                            <div className="modal-badges">
                                <div className={`mode-badge ${isAdvancedMode ? 'advanced' : 'easy'}`}>
                                    {isAdvancedMode ? "🎨 Advanced" : "✨ Easy"}
                                </div>
                                <div className="type-badge">
                                    {CLOTH_TYPE_ICONS[localDesign.clothType]} {CLOTH_TYPE_LABELS[localDesign.clothType]}
                                </div>
                            </div>
                        </div>

                        <div className="modal-preview-container">
                            <ClothItemPreview
                                isAdvancedMode={isAdvancedMode}
                                cartItem={designToCartItem(localDesign)}
                                tempRotationY={rotationY}
                            />
                        </div>

                        <div className="rotation-control">
                            <label className="rotation-label">
                                Rotation: <span className="rotation-value">{Math.round(rotationY)}°</span>
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={rotationY}
                                onChange={(e) => setRotationY(Number(e.target.value))}
                                className="rotation-slider"
                            />
                            <div className="rotation-buttons">
                                <button
                                    onClick={() => setRotationY(prev => (prev - 90 + 360) % 360)}
                                    className="rotation-btn"
                                >
                                    ↶ 90°
                                </button>
                                <button
                                    onClick={() => setRotationY(prev => (prev + 90) % 360)}
                                    className="rotation-btn"
                                >
                                    90° ↷
                                </button>
                            </div>
                        </div>

                        <div className="modal-info-grid">
                            <div className="info-item">
                                <span className="info-label">❤️ Likes:</span>
                                <span className="info-value">{formatLikes(localDesign.likesCount || 0)}</span>
                            </div>
                            {localDesign.price && (
                                <div className="info-item">
                                    <span className="info-label">💰 Price:</span>
                                    <span className="info-value price">${localDesign.price.toFixed(2)}</span>
                                </div>
                            )}
                            {localDesign.salesCount !== undefined && (
                                <div className="info-item">
                                    <span className="info-label">🛒 Sales:</span>
                                    <span className="info-value">{localDesign.salesCount || 0}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">📅 Created:</span>
                                <span className="info-value">
                                    {new Date(localDesign.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={handleToggleLike}
                                className={`like-btn-sm ${localDesign.isLikedByUser ? 'liked' : ''}`}
                            >
                                {localDesign.isLikedByUser ? '❤️ Liked' : '🤍 Like'}
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="cart-btn"
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                onClick={handleViewFullPage}
                                className="view-all-btn"
                            >
                                📚 View All Designs
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DesignCardSmall;