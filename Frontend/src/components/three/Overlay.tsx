import logo from "../../assets/logo.png";
import {
  AiOutlineHighlight,
  AiOutlineLeftCircle,
  AiOutlineShopping,
} from "react-icons/ai";
import { GiShorts, GiBilledCap, GiHoodie } from "react-icons/gi";
import { FaTshirt } from "react-icons/fa";
import { GiConverseShoe, GiRunningShoe } from "react-icons/gi";
import { RiNftFill } from "react-icons/ri";

import "../../styles/overlay.css";

// UPDATED: Import from centralized state file
import { snapshot, useSnapshot } from "valtio";
import { state } from "../../state";
import { addClothToCart } from "../../services/cartService";

const Overlay = () => {
  const snap = useSnapshot(state);
  console.log("👀 Overlay rendered");

const TYPE_OPTIONS = [
  { value: "t_shirt_sport", label: "Sport", icon: <FaTshirt /> },
  { value: "t_shirt_classic", label: "Classic", icon: <FaTshirt /> },
  { value: "cap", label: "Cap", icon: <GiBilledCap /> },
  { value: "hoodie", label: "Hoodie", icon: <GiHoodie /> },
  { value: "shoe", label: "Shoe", icon: <GiRunningShoe /> }, 
];

  return (
    <div className="overlay-container">
      <header className="overlay-header">
       
        <div className="overlay-icons">
          {/* ред с back стрелката и избраният надпис */}
          <div className="overlay-current">
            <AiOutlineLeftCircle
              size="1.5em"
              className="icon-btn"
              onClick={() => {
                state.page = "intro";
              }}
            />
            <p className="current-label">
              {TYPE_OPTIONS.find((o) => o.value === snap.selected_type)?.label}
            </p>
          </div>

          {/* вертикален списък с опциите */}
          <div className="type-options-col">
            {TYPE_OPTIONS.map((opt) => {
              const active = snap.selected_type === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`type-icon ${active ? "active" : ""}`}
                  onClick={() => (state.selected_type = opt.value)}
                >
                  <span className="icon-emoji">{opt.icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {snap.page == 'intro' ? <Intro /> : <Customizer />}
    </div>
  );
};
export default Overlay;

const Intro = () => {
  return (
    <section className="overlay-main">
      <div className="overlay-text">
        <h1>LET'S DO IT.</h1>
        <p>
          Create your unique and exclusive shirt with our brand-new{" "}
          <strong>3D customization tool.</strong> Unleash your imagination and
          define your own style.
        </p>

        <button
          className="overlay-btn"
          onClick={() => {
            state.page= "basic";
          }}
        >
          CUSTOMIZE IT easy <AiOutlineHighlight size="1.3em" />
        </button>
        <p>or </p>
        <button
          className="overlay-btn"
          onClick={() => {
            state.page= "advanced";
          }}
        >
          CUSTOMIZE IT like artist <AiOutlineHighlight size="1.3em" />
        </button>
      </div>
    </section>
  );
};

import type { FC } from "react";
import {
  AiFillCamera,
  AiOutlineArrowLeft,
  AiOutlineSave,
} from "react-icons/ai";
import "../../styles/customizer.css";

const colors = [
  "#ccc",
  "#EFBD4E",
  "#80C670",
  "#726DE8",
  "#EF674E",
  "#353934",
  "purple",
];

const decals = ["react", "three2", "style_mint", "linux"];

export const Customizer: FC = () => {
  const snap = useSnapshot(state);
  
  // Handler for adding item to cart
  const handlePurchase = async () => {
    console.log("🛒 Purchase button clicked in Overlay");
    console.log("🛒 Current state:", {
      selectedColor: state.selectedColor,
      selectedDecal: state.selectedDecal,
      selected_type: state.selected_type,
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
    <>
      {" "}
      <button
        className="exit-btn"
        onClick={() => {
          state.page = "intro";
          console.log("nback");
        }}
      >
        GO BACK
        <AiOutlineArrowLeft size="1.3em" />
      </button>
      <section key="custom" className="customizer-section">
        <div className="customizer">
          {/* Color palette */}
          <div className="customizer-options">
            <div className="color-options">
              {colors.map((color) => (
                <div
                  key={color}
                  className="circle"
                  style={{ background: color }}
                  title={color}
                  onClick={() => {
                    state.selectedColor = color;
                  }}
                ></div>
              ))}
            </div>

            {/* Decal selection */}
 { snap.page === "advanced" && (
            <div className="adv-overlay">
              <div className="adv-block">
                <label>Rotate Y: {snap.rotationY}°</label>
                <input type="range" min={0} max={360}
                       value={snap.rotationY}
                       onChange={(e)=> state.rotationY = +e.target.value}/>
              </div>
            </div>
          )}
            <div className="decals--container">
              {snap.decals.map((decal) => (
                <div
                  key={decal}
                  className="decal"
                  onClick={() => (state.selectedDecal = decal)}
                >
                  <img src={`/images/${decal}_thumb.png`} alt={decal} />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="customizer-buttons">
            <button className="share-btn" onClick={handlePurchase}>
              ADD TO CART
              <AiOutlineShopping size="1.3em" />
            </button>

            <button className="save-btn">
              SAVE YOUR STYLE
              <AiOutlineSave size="1.3em" />
            </button>

            <button className="share-btn">
              Add Nft 
             <RiNftFill />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};