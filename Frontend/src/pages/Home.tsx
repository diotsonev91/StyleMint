import React from "react";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Design. Wear. Own the Future.</h1>
        <p>Create your unique 3D fashion experience.</p>
        <button className="btn-primary">Start Customizing</button>
      </section>
    </div>
  );
};

export default Home;
