// GodotGameEmbedColorRush.tsx - FINAL VERSION
// Хваща postMessage от WebBridge

import React, { useEffect, useState } from 'react';
import { gameService, GameType, LeaderboardEntryDTO, GameSessionDTO } from '../../services/gameService';

import './GodotGameEmbed.css';
import GameOverModal from "../../components/games/GameOverModal";

interface GameScore {
    score: number;
    timestamp: number;
    game_mode?: string;
    difficulty?: string;
    date?: string;
}

interface GodotRunnerGameProps {
    gameTitle?: string;
    width?: string | number;
    height?: string | number;
}

const GodotGameEmbedRush: React.FC<GodotRunnerGameProps> = ({
                                                                gameTitle = '3D Runner Game',
                                                                width = '60%',
                                                                height = '600px'
                                                            }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [topScores, setTopScores] = useState<LeaderboardEntryDTO[]>([]);

    const [showGameOver, setShowGameOver] = useState(false);
    const [currentGameSession, setCurrentGameSession] = useState<GameSessionDTO | undefined>();
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        // Хващай postMessage от iframe
        const handleMessage = (event: MessageEvent) => {
            console.log('📥 React received message:', event.data);

            // Провери дали е от Godot
            if (event.data && event.data.type === 'GODOT_GAME_OVER') {
                console.log('✅ GODOT_GAME_OVER detected!');
                console.log('   Payload:', event.data.payload);
                handleGameOver(event.data.payload);
            } else {
                console.log('   Not a game over message, ignoring');
            }
        };

        window.addEventListener('message', handleMessage);
        console.log('✅ Message listener attached');

        // Също така setup на fallback (за backward compatibility)
        (window as any).onGodotGameOver = (data: GameScore) => {
            console.log('🎮 onGodotGameOver (fallback) called with:', data);
            handleGameOver(data);
        };

        fetchTopScores();

        return () => {
            window.removeEventListener('message', handleMessage);
            delete (window as any).onGodotGameOver;
        };
    }, []);

    const handleGameOver = async (data: GameScore) => {
        console.log('🎮 handleGameOver called with:', data);

        // WebBridge изпраща Unix timestamp в секунди, конвертирай в milliseconds
        const score = data.score;
        const timestamp = data.timestamp ? data.timestamp * 1000 : Date.now();

        console.log('   Processing score:', score);
        console.log('   Processing timestamp:', timestamp);

        setLastScore(score);
        await sendScoreToBackend({ score, timestamp });
        await fetchTopScores();
    };

    const sendScoreToBackend = async (gameData: { score: number; timestamp: number }) => {
        setSaveStatus('saving');
        console.log('💾 Sending score to backend:', gameData);

        const result = await gameService.saveScore({
            score: gameData.score,
            timestamp: gameData.timestamp,
            gameName: '3d-runner'
        });

        if (result.success) {
            console.log('✅ Score saved successfully:', result.data);
            setSaveStatus('success');

            if (result.data) {
                console.log('   Setting game session and showing modal');
                setCurrentGameSession(result.data);
                setShowGameOver(true);
            }
        } else {
            console.error('❌ Error saving score:', result.error);
            setSaveStatus('error');
        }

        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    const fetchTopScores = async () => {
        const result = await gameService.fetchLeaderboard(GameType.COLOR_RUSH, 10);

        if (result.success && result.data) {
            setTopScores(result.data);
        }
    };

    const handleClaimReward = async (sessionId: string) => {
        setIsClaiming(true);

        const result = await gameService.claimReward(sessionId);

        if (result.success && result.data) {
            console.log('✅ Reward claimed:', result.data);
            setCurrentGameSession(result.data);
        } else {
            console.error('❌ Failed to claim reward:', result.error);
            alert('Failed to claim reward. Please try again.');
        }

        setIsClaiming(false);
    };

    const handlePlayAgain = () => {
        setShowGameOver(false);
        setCurrentGameSession(undefined);
        setLastScore(null);
        window.location.reload();
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
        console.log('✅ Iframe loaded and ready');
    };

    return (
        <>
            <div
                className="godot-game-container runner-game"
                style={{ width, height, position: 'relative' }}
            >
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
                        <details open>
                            <summary style={{cursor: 'pointer'}}>🔧 Debug</summary>
                            <div style={{marginTop: '8px', lineHeight: '1.5'}}>
                                <p><strong>Game:</strong> 3D Runner (iframe)</p>
                                <p><strong>Source:</strong> /game/runner.html</p>
                                <p><strong>Handler:</strong> postMessage listener</p>
                                <p><strong>Last Score:</strong> {lastScore ?? 'None'}</p>
                                <p><strong>Save Status:</strong> {saveStatus}</p>
                                <p><strong>Modal Open:</strong> {showGameOver ? 'Yes' : 'No'}</p>
                                <p><strong>Backend:</strong> {gameService.getBackendUrl()}</p>
                                <p><strong>Leaderboard:</strong> {topScores.length} entries</p>
                            </div>
                        </details>
                    </div>
                )}
            </div>

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
                        🏆 Top Color Rush Scores
                    </div>
                    <div>
                        {topScores.slice(0, 8).map((entry) => (
                            <div
                                key={`${entry.userId}-${entry.rank}`}
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
                                <span style={{fontWeight: 'bold', marginRight: '10px', fontSize: '18px'}}>
                                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}.`}
                                </span>
                                <span style={{flex: 1}}>{entry.displayName}</span>
                                <span style={{fontWeight: 'bold', color: '#fbbf24'}}>
                                  {entry.totalScore.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <GameOverModal
                isOpen={showGameOver}
                onClose={() => setShowGameOver(false)}
                gameSession={currentGameSession}
                onPlayAgain={handlePlayAgain}
                onClaimReward={handleClaimReward}
                claiming={isClaiming}
            />
        </>
    );
};

export default GodotGameEmbedRush;