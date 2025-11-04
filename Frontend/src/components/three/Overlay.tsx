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
import { SaveDesignModal } from "../SaveDesignModal";
import "../../styles/overlay.css";
import { useAuth } from "../../hooks/useAuth";
// UPDATED: Import from centralized state file
import { snapshot, useSnapshot } from "valtio";
import { state } from "../../state";
import { addClothToCart } from "../../services/cartService";
import { LoginRequiredModal } from "../LoginRequiredModal";

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
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAdvancedClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    state.page = "advanced";
  };

  return (
    <section className="overlay-main">
      <div className="overlay-text">
        <h1>LET'S DO IT.</h1>
        <p>
          Create your unique and exclusive shirt with our brand-new{" "}
          <strong>3D customization tool.</strong> Unleash your imagination and
          define your own style.
        </p>

        <button className="overlay-btn" onClick={() => (state.page = "basic")}>
          CUSTOMIZE IT easy <AiOutlineHighlight size="1.3em" />
        </button>
        <p>or</p>
        <button className="overlay-btn" onClick={handleAdvancedClick}>
          CUSTOMIZE IT like artist <AiOutlineHighlight size="1.3em" />
        </button>
      </div>

      {/* Pretty popup */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

import { useState, type FC } from "react";
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


export const Customizer: FC = () => {
  const snap = useSnapshot(state);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
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
const handleSaveSuccess = (design: any) => {
    console.log("Design saved successfully:", design);
    // You can update state or show a success message
  };
function uploadImageAsDecal() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Clean up previous custom decal URL to avoid memory leaks
      if (state.customDecal) {
        URL.revokeObjectURL(state.customDecal.previewUrl);
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      // Remove previous custom decal from decals array if it exists
      const previousCustomDecal = state.decals.find(d => d.startsWith('custom'));
      if (previousCustomDecal) {
        state.decals = state.decals.filter(d => d !== previousCustomDecal);
      }
      
      // Add new custom decal
      const customDecalId = 'custom';
      state.customDecal = {
        file,
        previewUrl
      };
      
      // Add to decals array and select it
      state.decals = [...state.decals, customDecalId];
      state.selectedDecal = customDecalId;
      
      // Optionally add to userDesigns for history
      state.userDesigns.push({
        id: customDecalId,
        file,
        previewUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  input.click();
}

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
      className={`decal ${snap.selectedDecal === decal ? 'selected' : ''}`}
      onClick={() => (state.selectedDecal = decal)}
    >
      {decal === 'custom' ? (
        // Custom decal - използвай previewUrl
        snap.customDecal ? (
          <img 
            src={snap.customDecal.previewUrl} 
            alt="Custom decal" 
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '50px', 
            height: '50px', 
            background: '#f0f0f0',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            Custom
          </div>
        )
      ) : (
        // Regular decal - зарежда от /images/
        <img src={`/images/${decal}_thumb.png`} alt={decal} />
      )}
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

            <button className="save-btn"
             onClick={() => setIsSaveModalOpen(true)}
            >
              SAVE YOUR STYLE
              <AiOutlineSave size="1.3em" />
            </button>

           { snap.page === "advanced" && 
           <button className="share-btn"  onClick={uploadImageAsDecal}>
              Upload your decal to use it
             <RiNftFill />
            </button> }
          </div>
        </div>
      </section>
      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
};