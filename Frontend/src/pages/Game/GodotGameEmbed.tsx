// src/components/GodotGameEmbed.tsx
import React, { useEffect, useRef, useState } from 'react';
import './GodotGameEmbed.css';



interface GodotGameEmbedProps {
  backendUrl?: string;
  authToken?: string;
  gameTitle?: string;
  width?: string | number;
  height?: string | number;
}

const GodotGameEmbed: React.FC<GodotGameEmbedProps> = ({
  backendUrl = 'http://localhost:8080',
  authToken = '',
  gameTitle = 'Game',
  width = '100%',
  height = '600px'
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

    const [topScores, setTopScores] = useState<Array<{rank: number, username: string, score: number}>>([]);
console.log("STATE AFTER SET:", topScores);


  useEffect(() => {
    // Inject game configuration into window before loading Godot
    (window as any).GAME_CONFIG = {
      backendUrl: backendUrl,
      authToken: authToken
    };

    console.log('Game config injected:', (window as any).GAME_CONFIG);

    fetchTopScores();


    // Wait for Engine to be available (script may still be loading)
    const checkEngineAndLoad = () => {
      if ((window as any).Engine) {
        console.log('Engine found, loading game...');
        loadGodotGame();
      } else {
        console.log('Engine not ready yet, waiting...');
        setTimeout(checkEngineAndLoad, 100);
      }
    };


    // Start checking
    checkEngineAndLoad();

    return () => {
      // Cleanup
      delete (window as any).GAME_CONFIG;
    };
  }, [backendUrl, authToken]);


const fetchTopScores = async () => {
    console.log("INSIDE FETCH TOP SCORES")
    setTopScores([
        { rank: 1, username: 'ProGamer', score: 15420 },
        { rank: 2, username: 'SpeedRunner', score: 14850 },
        { rank: 3, username: 'NightHawk', score: 13990 },
        { rank: 4, username: 'CyberNinja', score: 12750 },
        { rank: 5, username: 'PixelMaster', score: 11680 },
        { rank: 6, username: 'RetroKing', score: 10920 },
        { rank: 7, username: 'ArcadeAce', score: 9845 },
        { rank: 8, username: 'NeonRider', score: 8770 },
        { rank: 9, username: 'SynthWave', score: 7650 },
        { rank: 10, username: 'VaporQueen', score: 6540 }
      ]);
    try {
      const response = await fetch(`${backendUrl}/api/game/leaderboard/top10`);
      if (response.ok) {
        const data = await response.json();
        setTopScores(data);
      } else {
        // Use mock data if API fails
        setTopScores([
          { rank: 1, username: 'ProGamer', score: 15420 },
          { rank: 2, username: 'SpeedRunner', score: 14850 },
          { rank: 3, username: 'NightHawk', score: 13990 },
          { rank: 4, username: 'CyberNinja', score: 12750 },
          { rank: 5, username: 'PixelMaster', score: 11680 },
          { rank: 6, username: 'RetroKing', score: 10920 },
          { rank: 7, username: 'ArcadeAce', score: 9845 },
          { rank: 8, username: 'NeonRider', score: 8770 },
          { rank: 9, username: 'SynthWave', score: 7650 },
          { rank: 10, username: 'VaporQueen', score: 6540 }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err);
      // Use mock data
      setTopScores([
        { rank: 1, username: 'ProGamer', score: 15420 },
        { rank: 2, username: 'SpeedRunner', score: 14850 },
        { rank: 3, username: 'NightHawk', score: 13990 },
        { rank: 4, username: 'CyberNinja', score: 12750 },
        { rank: 5, username: 'PixelMaster', score: 11680 },
        { rank: 6, username: 'RetroKing', score: 10920 },
        { rank: 7, username: 'ArcadeAce', score: 9845 },
        { rank: 8, username: 'NeonRider', score: 8770 },
        { rank: 9, username: 'SynthWave', score: 7650 },
        { rank: 10, username: 'VaporQueen', score: 6540 }
      ]);
    }
    
  };

  const loadGodotGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Engine is available
      if (!(window as any).Engine) {
        throw new Error('Godot Engine not loaded. Make sure index.js is loaded in index.html');
      }

      const Engine = (window as any).Engine;
      
      // Godot config from your export
      const GODOT_CONFIG = {
        args: [],
        canvasResizePolicy: 2,
        executable: 'index',
        experimentalVK: false,
        fileSizes: {
          'index.pck': 3020004,
          'index.wasm': 36145869
        },
        focusCanvas: true,
        gdextensionLibs: []
      };

      // Create engine instance with Godot's config
      const engine = new Engine(GODOT_CONFIG);

      // Get canvas element
      const canvas = canvasRef.current?.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Start the game with progress callback
      await engine.startGame({
        canvas: canvas,
        onProgress: (current: number, total: number) => {
          if (total > 0) {
            const progress = Math.round((current / total) * 100);
            setLoadingProgress(progress);
            console.log(`Loading: ${progress}%`);
          }
        },
        onPrint: (...args: any[]) => {
          console.log('[Godot]:', ...args);
        },
        onPrintError: (...args: any[]) => {
          console.error('[Godot Error]:', ...args);
        }
      });

      setIsLoading(false);
      console.log('Godot game loaded successfully!');
      console.log('Backend URL:', backendUrl);
      console.log('Auth Token:', authToken ? 'Set' : 'Not set');

    } catch (err: any) {
      console.error('Error loading Godot game:', err);
      setError(err.message || 'Failed to load game');
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    const container = canvasRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div className="godot-game-container" style={{ width, height }}>
      {/* Loading Screen */}
      {isLoading && (
        <div className="game-loading">
          <div className="loading-content">
            <div className="game-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Loading {gameTitle}...</h2>
            <div className="loading-bar">
              <div 
                className="loading-progress" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="loading-percentage">{loadingProgress}%</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {error && (
        <div className="game-error">
          <div className="error-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2>Failed to Load Game</h2>
            <p>{error}</p>
            <button onClick={loadGodotGame} className="retry-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      )}



      {/* Top 10 scores from users */}
       {!isLoading && !error && (
        <div className='leaderboard'>
          <div className="leaderboard-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3>Top Scores</h3>
          </div>
          <div className="leaderboard-list">
            {topScores.map((entry) => (
              <div 
                key={entry.rank} 
                className={`leaderboard-item ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
              >
                <div className="rank-badge">
                  {entry.rank <= 3 ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                    </svg>
                  ) : (
                    <span>{entry.rank}</span>
                  )}
                </div>
                <div className="player-info">
                  <span className="username">{entry.username}</span>
                </div>
                <div className="score-value">{entry.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Game Canvas */}
      <div 
        ref={canvasRef} 
        className={`game-canvas ${isLoading ? 'hidden' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <canvas id="godot-canvas"></canvas>
      </div>

      {/* Game Controls */}
      {!isLoading && !error && (
        <div className="game-controls">
          <button 
            onClick={toggleFullscreen} 
            className="control-btn"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          <div className="game-info">
            <span className="info-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Connected
            </span>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && !isLoading && !error && (
        <div className="debug-info">
          <details>
            <summary>Debug Info</summary>
            <div className="debug-content">
              <p><strong>Backend URL:</strong> {backendUrl}</p>
              <p><strong>Auth Token:</strong> {authToken ? '✓ Set' : '✗ Not set'}</p>
              <p><strong>Fullscreen:</strong> {isFullscreen ? 'Yes' : 'No'}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default GodotGameEmbed;