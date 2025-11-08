// src/components/GodotGameEmbedBPMMatcher.tsx
// СТРУКТУРА КАТО Color Rush - ИЗПОЛЗВА IFRAME!

import React, { useEffect, useState } from 'react';
import { gameService, GameScore } from '../../services/gameService';

interface GodotGameEmbedBPMProps {
  gameTitle?: string;
  width?: string | number;
  height?: string | number;
}

const GodotGameEmbedBPM: React.FC<GodotGameEmbedBPMProps> = ({
  gameTitle = 'BPM Matcher',
  width = '60%',
  height = '600px'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [topScores, setTopScores] = useState<Array<{rank: number, username: string, score: number}>>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GODOT_GAME_OVER') {
        console.log('🎵 BPM Game Over:', event.data.payload);
        handleGameOver(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    (window as any).onGodotGameOver = handleGameOver;
    
    // Inject config for iframe (no auth token needed - uses cookies)
    (window as any).GAME_CONFIG = {
      backendUrl: gameService.getBackendUrl()
    };

    fetchTopScores();

    return () => {
      window.removeEventListener('message', handleMessage);
      delete (window as any).onGodotGameOver;
      delete (window as any).GAME_CONFIG;
    };
  }, []);

  const handleGameOver = async (data: GameScore) => {
    console.log('🎵 BPM Game Over:', data);
    setLastScore(data.score);
    await sendScoreToBackend(data);
    await fetchTopScores();
  };

  const sendScoreToBackend = async (gameData: GameScore) => {
    setSaveStatus('saving');
    
    const result = await gameService.saveScore({
      score: gameData.score,
      timestamp: gameData.timestamp,
      date: gameData.date,
      gameMode: gameData.game_mode || 'normal',
      difficulty: gameData.difficulty || 'normal',
      gameName: 'bpm-matcher'
    });

    if (result.success) {
      console.log('✅ Score saved');
      setSaveStatus('success');
    } else {
      console.error('❌ Error:', result.error);
      setSaveStatus('error');
    }
    
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const fetchTopScores = async () => {
    const result = await gameService.fetchTopScores();
    
    if (result.success && result.data) {
      setTopScores(result.data);
    } else {
      console.log('Using mock scores (backend not available)');
      setTopScores(gameService.getMockScores('bpm'));
    }
  };

  return (
    <div style={{display: 'flex'}}>
    <div style={{ width, height, position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎵</div>
            <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>{gameTitle}</h2>
            <div className="loading-spinner"></div>
            <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '10px' }}>
              Match the beat!
            </p>
          </div>
        </div>
      )}

      {/* КРИТИЧНО: IFRAME точно както в Color Rush! */}
      <iframe
        src="/bpm-game/bpm.html"
        title={gameTitle}
        onLoad={() => {
          setIsLoading(false);
          console.log('✅ BPM iframe loaded');
        }}
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
              <p><strong>Game:</strong> BPM Matcher (iframe)</p>
              <p><strong>Source:</strong> /bpm-game/bpm.html</p>
              <p><strong>Last Score:</strong> {lastScore ?? 'None'}</p>
              <p><strong>Status:</strong> {saveStatus}</p>
              <p><strong>Backend:</strong> {gameService.getBackendUrl()}</p>
            </div>
          </details>
        </div>
      )}
    </div>

    {saveStatus !== 'idle' && (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        background: saveStatus === 'success' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : '#f59e0b',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 200
      }}>
        {saveStatus === 'saving' && '💾 Saving...'}
        {saveStatus === 'success' && '✅ Saved!'}
        {saveStatus === 'error' && '❌ Failed'}
      </div>
    )}

    {lastScore !== null && (
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 200
      }}>
        Score: <span style={{fontSize: '18px', color: '#fde047'}}>{lastScore}</span>
      </div>
    )}

    {!isLoading && topScores.length > 0 && (
      <div style={{
        marginTop: '5px',
        marginLeft: '105px',
        background: 'rgba(0,0,0,0.85)',
        borderRadius: '12px',
        padding: '15px',
        minWidth: '600px',
        minHeight: '450px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          color: 'white',
          margin: '10px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🏆 Top BPM Scores
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
                background: entry.rank <= 3 
                  ? 'linear-gradient(135deg, rgba(79,172,254,0.3), rgba(0,242,254,0.3))' 
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                width:'400px'
              }}
            >
              <span style={{fontWeight: 'bold', marginRight: '10px', fontSize: '18px'}}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}.`}
              </span>
              <span style={{flex: 1}}>{entry.username}</span>
              <span style={{fontWeight: 'bold', color: '#4facfe'}}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );
};

export default GodotGameEmbedBPM;