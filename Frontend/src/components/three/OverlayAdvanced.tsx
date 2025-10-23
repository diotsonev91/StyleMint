// src/components/three/OverlayAdvanced.tsx
import { useSnapshot } from "valtio";
import { state } from "../../state/Store";
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineShopping,
} from "react-icons/ai";
import "../../styles/overlay-advanced.css";

export default function OverlayAdvanced() {
  const snap = useSnapshot(state);

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

      <button className="adv-btn" onClick={() => console.log("PURCHASE")}>
        <AiOutlineShopping /> PURCHASE
      </button>
    </div>
  );
}
