// src/components/three/OverlayAdvanced.tsx
// UPDATED: Import from centralized state file
import { useSnapshot } from "valtio";
import { state } from "../../state";
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineShopping,
} from "react-icons/ai";
import "../../styles/overlay-advanced.css";
import { addClothToCart } from "../../services/cartService";

export default function OverlayAdvanced() {
  const snap = useSnapshot(state);

  // Handler for adding item to cart
  const handlePurchase = async () => {
    console.log("🛒 Purchase button clicked in OverlayAdvanced");
    console.log("🛒 Current state:", {
      selectedColor: state.selectedColor,
      selectedDecal: state.selectedDecal,
      selected_type: state.selected_type,
      rotationY: state.rotationY,
    });
    
    try {
      await addClothToCart();
      alert("Item added to cart successfully! 🎉");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  return (
    <div className="adv-overlay">
      <button className="adv-btn" onClick={() => console.log("Back")}>
        <AiOutlineArrowLeft /> BACK
      </button>

      <div className="adv-block">
        <label>Rotate Y: {snap.rotationY}°</label>
        <input
          className="adv-slider"
          type="range"
          min={0}
          max={360}
          value={snap.rotationY}
          onChange={(e) => (state.rotationY = +e.target.value)}
        />
      </div>

      <button className="adv-btn" onClick={() => console.log("SAVE")}>
        <AiOutlineSave /> SAVE
      </button>

      <button className="adv-btn" onClick={handlePurchase}>
        <AiOutlineShopping /> ADD TO CART
      </button>
    </div>
  );
}