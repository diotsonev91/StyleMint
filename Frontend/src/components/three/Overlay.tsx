import logo from "../../assets/logo.png";
import {
  AiOutlineAlipayCircle,
  AiOutlineBars,
  AiOutlineHighlight,
  AiOutlineLeftCircle,
  AiOutlineShopping,
} from "react-icons/ai";
import { GiShorts, GiBilledCap, GiHoodie } from "react-icons/gi";
import { FaTshirt } from "react-icons/fa";

import "../../styles/overlay.css";

import { snapshot, useSnapshot } from "valtio";
import { state } from "../../state/Store";

const Overlay = () => {
  const snap = useSnapshot(state);
  const TYPE_OPTIONS = [
    { value: "t_shirt_sport", label: "Sport", icon: <FaTshirt /> },
    { value: "t_shirt_classic", label: "Classic", icon: <FaTshirt /> },
    { value: "cap", label: "Cap", icon: <GiBilledCap /> },
    { value: "hoodie", label: "Hoodie", icon: <GiHoodie /> },
  ];

  return (
    <div className="overlay-container">
      <header className="overlay-header">
        <img
          src={logo}
          alt="StyleMint logo"
          width={180}
          height={180}
          className="logo"
        />
        <div className="overlay-icons">
          {/* ред с back стрелката и избрания надпис */}
          <div className="overlay-current">
            <AiOutlineLeftCircle
              size="1.5em"
              className="icon-btn"
              onClick={() => {
                state.intro = true;
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

      {snap.intro ? <Intro /> : <Customizer />}
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
            state.intro = false;
          }}
        >
          CUSTOMIZE IT <AiOutlineHighlight size="1.3em" />
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
  return (
    <>
      {" "}
      <button
        className="exit-btn"
        onClick={() => {
          state.intro = true;
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
            <button className="share-btn">
              PURCHASE
              <AiOutlineShopping size="1.3em" />
            </button>

            <button className="save-btn">
              SAVE YOUR STYLE
              <AiOutlineSave size="1.3em" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
