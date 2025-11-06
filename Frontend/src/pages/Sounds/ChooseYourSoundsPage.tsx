// src/components/ChooseYourSoundsPage.tsx
import React, { useState } from 'react';
import './ChooseYourSoundsPage.css';
import { useNavigate } from 'react-router-dom';
import { ProducerSection } from './ProducerSection';



const ChooseYourSoundsPage: React.FC = () => {


  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
const navigate = useNavigate();
  const cards = [
    {
      id: 'packs',
      title: 'Sample Packs',
      subtitle: 'Curated Collections',
      description: 'Browse premium sample packs from top artists and labels. Complete collections ready to inspire your next hit.',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
      path: '/sample-packs',
      color: 'purple',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      stats: ['200+ Packs', 'Top Artists', 'Complete Sets']
    },
    {
      id: 'samples',
      title: 'Individual Samples',
      subtitle: 'Mix & Match',
      description: 'Discover thousands of individual samples. Build your own unique collection from our entire library.',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
      path: '/samples',
      color: 'pink',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      stats: ['5000+ Sounds', 'All Genres', 'High Quality']
    }
  ];

  return (
    <div className="choose-sounds-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Content */}
      <div className="choose-sounds-content">
        {/* Header */}
        <header className="choose-sounds-header">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="logo-text">Mint your sound</h1>
          </div>

          <div className="header-content">
            <h2 className="main-title">Choose Your Sound Journey</h2>
            <p className="main-subtitle">
              How would you like to explore our collection?
            </p>
          </div>
        </header>

        {/* Cards */}
        <div className="cards-container">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`sound-card ${card.color} ${hoveredCard === card.id ? 'hovered' : ''} ${hoveredCard && hoveredCard !== card.id ? 'dimmed' : ''}`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(card.path)}
            >
              {/* Background Image */}
              <div className="card-background">
                <img src={card.image} alt={card.title} />
                <div className="card-overlay"></div>
              </div>

              {/* Content */}
              <div className="card-content">
                {/* Icon */}
                <div className="card-icon">
                  {card.icon}
                </div>

                {/* Text */}
                <div className="card-text">
                  <span className="card-subtitle">{card.subtitle}</span>
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>

                {/* Stats */}
                <div className="card-stats">
                  {card.stats.map((stat, index) => (
                    <span key={index} className="card-stat">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {stat}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="card-cta">
                  <span>Explore Now</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                {/* Decorative Elements */}
                <div className="card-decoration">
                  <div className="decoration-circle"></div>
                  <div className="decoration-circle"></div>
                  <div className="decoration-circle"></div>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="card-shine"></div>
            </div>
          ))}
        </div>

        <ProducerSection />

        {/* Footer Info */}
        <div className="choose-sounds-footer">
          <p className="footer-text">
            Not sure where to start? Try browsing our curated sample packs for instant inspiration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChooseYourSoundsPage;