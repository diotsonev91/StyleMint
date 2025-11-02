// src/components/GodotRunnerGame.tsx
import React, { useEffect, useState } from 'react';
import './GodotGameEmbed.css';

interface GameScore {
  score: number;
  timestamp: number;
  date: string;
  game_mode: string;
  difficulty: string;
}

interface GodotRunnerGameProps {
  backendUrl?: string;
  authToken?: string;
  gameTitle?: string;
  width?: string | number;
  height?: string | number;
}

const GodotGameEmbedRush: React.FC<GodotRunnerGameProps> = ({
  backendUrl = 'http://localhost:8080',
  authToken = '',
  gameTitle = '3D Runner Game',
  width = '60%',
  height = '600px'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [topScores, setTopScores] = useState<Array<{rank: number, username: string, score: number}>>([]);

  useEffect(() => {
    // Setup communication handler
    const handleMessage = (event: MessageEvent) => {
      // Security: Check origin if needed
      // if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'GODOT_GAME_OVER') {
        console.log('🎮 Game Over received from iframe:', event.data.payload);
        handleGameOver(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // Also setup global handler (in case Godot can reach parent)
    (window as any).onGodotGameOver = handleGameOver;
    
    // Inject config for potential use
    (window as any).GAME_CONFIG = {
      backendUrl: backendUrl,
      authToken: authToken
    };

    fetchTopScores();

    return () => {
      window.removeEventListener('message', handleMessage);
      delete (window as any).onGodotGameOver;
      delete (window as any).GAME_CONFIG;
    };
  }, [backendUrl, authToken]);

  const handleGameOver = async (data: GameScore) => {
    console.log('🎮 3D Runner Game Over:', data);
    setLastScore(data.score);
    
    await sendScoreToBackend(data);
    await fetchTopScores();
  };

  const sendScoreToBackend = async (gameData: GameScore) => {
    setSaveStatus('saving');
    console.log('💾 Sending score to backend...');

    try {
      const response = await fetch(`${backendUrl}/api/game/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          score: gameData.score,
          timestamp: gameData.timestamp,
          date: gameData.date,
          gameMode: gameData.game_mode || 'endless',
          difficulty: gameData.difficulty || 'normal',
          gameName: '3d-runner'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Score saved:', result);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

    } catch (err: any) {
      console.error('❌ Error saving score:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const fetchTopScores = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/game/leaderboard/top10`, {
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopScores(data);
      } else {
        useMockScores();
      }
    } catch (err) {
      console.log('Using mock scores (backend not available)');
      useMockScores();
    }
  };

  const useMockScores = () => {
    setTopScores([
      { rank: 1, username: 'ProRunner', score: 15420 },
      { rank: 2, username: 'SpeedDemon', score: 14850 },
      { rank: 3, username: 'NightRacer', score: 13990 },
      { rank: 4, username: 'CyberSprint', score: 12750 },
      { rank: 5, username: 'PixelJumper', score: 11680 },
      { rank: 6, username: 'CyberSprint', score: 12750 },
      { rank: 7, username: 'PixelJumper', score: 11680 }
    ]);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('✅ 3D Runner iframe loaded');
  };

  return (
    <>
    <div 
      className="godot-game-container runner-game" 
      style={{ width, height, position: 'relative' }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="game-loading" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="loading-content">
            <h2>🏃 Loading {gameTitle}...</h2>
            <div className="loading-spinner"></div>
            <p className="loading-tip">Use ← → to move, ↑ to jump</p>
          </div>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        src="/game/runner.html"
        title={gameTitle}
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          background: '#000',
          marginLeft: '8rem'
        }}
        allow="autoplay; fullscreen"
      />

     

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '11px',
          zIndex: 200
        }}>
          <details>
            <summary style={{cursor: 'pointer'}}>🔧 Debug</summary>
            <div style={{marginTop: '8px', lineHeight: '1.5'}}>
              <p><strong>Game:</strong> 3D Runner (iframe)</p>
              <p><strong>Source:</strong> /game/runner.html</p>
              <p><strong>Last Score:</strong> {lastScore ?? 'None'}</p>
              <p><strong>Save Status:</strong> {saveStatus}</p>
              <p><strong>Backend:</strong> {backendUrl}</p>
            </div>
          </details>
        </div>
      )}
    </div>
     {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div 
          className={`save-status save-${saveStatus}`}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            background: saveStatus === 'success' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {saveStatus === 'saving' && '💾 Saving...'}
          {saveStatus === 'success' && '✅ Score Saved!'}
          {saveStatus === 'error' && '❌ Save Failed'}
        </div>
      )}

      {/* Last Score */}
      {lastScore !== null && (
        <div 
          className="last-score-badge"
          style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          Last Score: <span style={{fontSize: '18px', color: '#fbbf24'}}>{lastScore}</span>
        </div>
      )}

      {/* Leaderboard */}
      {!isLoading && topScores.length > 0 && (
        <div 
          className='leaderboard'
          style={{
            
            
           marginTop: '5px',
          
            background: 'rgba(0,0,0,0.85)',
            borderRadius: '12px',
            padding: '15px',
            minWidth: '600px',
            minHeight: '450px',
            overflowY: 'auto',
            zIndex: 200,
            
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            color: 'white',
            marginTop: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            🏆 Top Scores
          </div>
          <div>
            {topScores.slice(0, 8).map((entry) => (
              <div 
                key={entry.rank}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px',
                  marginBottom: '5px',
                  background: entry.rank <= 3 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  width:'400px'
                }}
              >
                <span style={{fontWeight: 'bold', marginRight: '10px'}}>
                  {entry.rank <= 3 ? '⭐' : `${entry.rank}.`}
                </span>
                <span style={{flex: 1}}>{entry.username}</span>
                <span style={{fontWeight: 'bold', color: '#fbbf24'}}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default GodotGameEmbedRush;