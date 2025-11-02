// src/pages/GamesMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './GamesMenu.css';

const GamesMenu: React.FC = () => {
  return (
    <div className="games-menu-container">
      <div className="games-menu-header">
        <h1>🎮 Choose Your Game</h1>
        <p>Select a game to start playing</p>
      </div>

      <div className="games-grid">
        {/* Color Rush Card */}
        <Link to="/game/colorRush" className="game-card color-rush-card">
          <div className="game-card-inner">
            <div className="game-icon">
              🏃
            </div>
            <h2>Color Rush</h2>
            <p>Run and collect the right colored orbs!</p>
            <div className="game-tags">
              <span className="tag">3D</span>
              <span className="tag">Runner</span>
              <span className="tag">Fast-paced</span>
            </div>
            <div className="play-button">
              <span>Play Now</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* BPM Matcher Card */}
        <Link to="/game/bpmMatcher" className="game-card bpm-matcher-card">
          <div className="game-card-inner">
            <div className="game-icon">
              🎵
            </div>
            <h2>BPM Matcher</h2>
            <p>Match the beat and test your rhythm!</p>
            <div className="game-tags">
              <span className="tag">Music</span>
              <span className="tag">Rhythm</span>
              <span className="tag">Timing</span>
            </div>
            <div className="play-button">
              <span>Play Now</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Section (Optional) */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>1,234</h3>
            <p>Active Players</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>5,678</h3>
            <p>Games Played</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>987</h3>
            <p>High Scores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesMenu;