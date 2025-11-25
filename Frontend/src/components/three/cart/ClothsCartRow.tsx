// ClothesCartRow.tsx
import { useState, useEffect } from "react";
import { CartItemState } from "../../../state";
import { updateItemQuantity, removeItem } from "../../../services/cartService";
import { ThreeCanvas } from "../../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../../components/three/ThreeCanvasAdvanced";
import {ClothItemPreview} from "../previews/ClothItemPreview";

interface ClothesCartRowProps {
    item: CartItemState & { type: 'clothes' };
}

export function ClothesCartRow({ item }: ClothesCartRowProps) {
    const [rot, setRot] = useState<number>(item.rotationY ?? 0);
    const quantity = item.quantity || 1;
    const itemTotal = 29.99 * quantity;

    // Check if this item was created in advanced moderfbgtn
    const isAdvancedMode = !!item.decalPosition;

    useEffect(() => {
        setRot(item.rotationY ?? 0);
    }, [item.id, item.rotationY]);

    const updateQuantity = (newQuantity: number) => {
        if (newQuantity < 1) return;
        updateItemQuantity(item.id, newQuantity);
    };

    const _removeItem = () => {
        removeItem(item.id);
    };

    return (
        <div className="cart-item-card clothes-card">
            <button onClick={_removeItem} className="remove-button" title="Remove item">
                ✕
            </button>

            {/* Preview */}
            <ClothItemPreview
                isAdvancedMode={isAdvancedMode}
                cartItem={item}
                tempRotationY={rot}
            />

            <div className="cart-item-details">
                <div className="item-info-section">
                    <h3 className="item-name">{item.selected_type.replace(/_/g, ' ').toUpperCase()}</h3>

                    <div className="item-specs">
                        <div className="spec-row">
                            <span className="spec-label">Decal:</span>
                            <span className="spec-value">{item.selectedDecal}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Color:</span>
                            <div className="color-display">
                                <div className="color-swatch" style={{ backgroundColor: item.selectedColor }}></div>
                                <span className="spec-value">{item.selectedColor}</span>
                            </div>
                        </div>
                        {isAdvancedMode && item.ripples && item.ripples.length > 0 && (
                            <div className="spec-row">
                                <span className="spec-label">Ripples:</span>
                                <span className="spec-value">{item.ripples.length} effect(s)</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="quantity-section">
                    <label className="quantity-label">Quantity</label>
                    <div className="quantity-controls">
                        <button
                            onClick={() => updateQuantity(quantity - 1)}
                            className="quantity-btn quantity-decrease"
                            disabled={quantity <= 1}
                        >
                            −
                        </button>
                        <div className="quantity-display">{quantity}</div>
                        <button
                            onClick={() => updateQuantity(quantity + 1)}
                            className="quantity-btn quantity-increase"
                        >
                            +
                        </button>
                    </div>
                    <div className="item-price">${itemTotal.toFixed(2)}</div>
                </div>

                <div className="rotation-section">
                    <label className="rotation-label">
                        Preview Rotation: {Math.round(rot)}°
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={360}
                        value={rot}
                        onChange={(e) => setRot(+e.target.value)}
                        className="rotation-slider"
                    />
                </div>
            </div>
        </div>
    );
}