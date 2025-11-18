// CartItemPreview.tsx
import { ThreeCanvas } from "../../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../../components/three/ThreeCanvasAdvanced";

interface ClothItemPreviewProps {
    isAdvancedMode: boolean;
    cartItem: any;
    tempRotationY: number;
}
// TODO now this sets is inside cart to true because of the thee canvas component should pass it likew that
export function ClothItemPreview({ isAdvancedMode, cartItem, tempRotationY }: ClothItemPreviewProps) {
    return (
        <div className="cart-item-preview">
            {isAdvancedMode ? (
                <ThreeCanvasAdvanced
                    isInsideCart={true}
                    cartItem={cartItem}
                    tempRotationY={tempRotationY}
                />
            ) : (
                <ThreeCanvas
                    isInsideCart={true}
                    cartItem={cartItem}
                    tempRotationY={tempRotationY}
                />
            )}
        </div>
    );
}