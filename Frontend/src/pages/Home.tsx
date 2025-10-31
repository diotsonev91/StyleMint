import React from "react";
import "./home.css";

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Style Your Look. Sample Your Sound.</h1>
        <p>Blend fashion and music into one creative identity — customize your 3D wear and discover exclusive sound packs.</p>

        <button className="btn-primary">Start Customizing</button>
        <button className="btn-primary">Get samples</button>
      </section>
<main className="login-section">
  <h2 className="login-heading">Login for more</h2>
  <button className="login-btn" onClick={() => (window.location.href = "/login")}>
    Sign In
  </button>
</main>

    </div>
  );
};

export default Home;
