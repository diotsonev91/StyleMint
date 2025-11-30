// src/components/clothes/DesignCardSmall.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DesignCardSmall.css';
import {ClothItemPreview} from "../previews/ClothItemPreview";
import {ClothType, DesignPublicDTO} from "../../../api/clothDesign.api";

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

    const handleClick = () => {
        if (isLoggedIn) {
            navigate('/public-designs'); // Navigate to public designs page
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
            rotationY: customization?.rotationY || 0,
            ripples: [],
            quantity: 1,
            hasCustomDecal: customization?.hasCustomDecal ?? false,
            customDecalUrl: design.customDecalUrl ?? null,
        };
    };

    const formatLikes = (count: number): string => {
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
        return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
    };

    const isAdvancedMode = design.customizationType === "ADVANCED";

    return (
        <div 
            className={`design-card-small ${!isLoggedIn ? 'disabled' : ''}`}
            onClick={handleClick}
        >
            <div className="design-card-preview">
                <ClothItemPreview
                    isAdvancedMode={isAdvancedMode}
                    cartItem={designToCartItem(design)}
                    tempRotationY={design.customizationData?.rotationY ?? 0}
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
                    {CLOTH_TYPE_ICONS[design.clothType]} {CLOTH_TYPE_LABELS[design.clothType]}
                </div>

                <h3 className="design-card-title">
                    {design.label || CLOTH_TYPE_LABELS[design.clothType]}
                </h3>

                <div className="design-card-meta">
                    <span className="design-likes">
                        ❤️ {formatLikes(design.likesCount || 0)}
                    </span>
                    {design.price && (
                        <span className="design-price">${design.price.toFixed(2)}</span>
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
    );
};

export default DesignCardSmall;
