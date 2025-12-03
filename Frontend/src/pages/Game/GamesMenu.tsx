// src/pages/GamesMenu.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from "../../hooks/useAuth";
import './GamesMenu.css';
import { gameService, GameSessionDTO, GameType, GlobalStats, LeaderboardEntryDTO } from "../../services/gameService";

interface UserBestScores {
    colorRush: number;
    bpmMatcher: number;
}

const GamesMenu: React.FC = () => {
    const {user} = useAuth();
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [unclaimedRewards, setUnclaimedRewards] = useState<GameSessionDTO[]>([]);
    const [bestScores, setBestScores] = useState<UserBestScores>({
        colorRush: 0,
        bpmMatcher: 0
    });
    const [globalStats, setGlobalStats] = useState<GlobalStats>({
        activePlayers: 0,
        totalGamesPlayed: 0,
        totalHighScores: 0
    });
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDTO[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [scoresLoading, setScoresLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set());

    const navigate = useNavigate();

    useEffect(() => {

        if(user?.id){
            setCurrentUserId(user.id)
        }

        loadUnclaimedRewards();
        loadBestScores();
        loadGlobalStats();
        loadGlobalLeaderboard();
    }, []);

    const loadUnclaimedRewards = async () => {
        try {
            setLoading(true);
            const result = await gameService.getUnclaimedRewards();

            if (result.success && result.data) {
                const rewards = result.data.filter(s => s.rewardType != null);
                setUnclaimedRewards(rewards);
            } else {
                setError(result.error || 'Failed to load rewards');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load rewards');
        } finally {
            setLoading(false);
        }
    };

    const loadBestScores = async () => {
        try {
            setScoresLoading(true);

            const [colorRushResult, bpmMatcherResult] = await Promise.all([
                gameService.getBestScore(GameType.COLOR_RUSH),
                gameService.getBestScore(GameType.BPM_MATCHER)
            ]);

            setBestScores({
                colorRush: colorRushResult.success ? colorRushResult.data || 0 : 0,
                bpmMatcher: bpmMatcherResult.success ? bpmMatcherResult.data || 0 : 0
            });

        } catch (err: any) {
            console.error('Error loading best scores:', err);
        } finally {
            setScoresLoading(false);
        }
    };

    const loadGlobalStats = async () => {
        try {
            setStatsLoading(true);
            const result = await gameService.getGlobalStats();

            if (result.success && result.data) {
                setGlobalStats(result.data);
            }
        } catch (err: any) {
            console.error('Error loading global stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadGlobalLeaderboard = async () => {
        try {
            setLeaderboardLoading(true);
            const result = await gameService.fetchTopScores(); // Използвай fetchTopScores без параметър за глобален

            if (result.success && result.data) {
                setLeaderboard(result.data);
            }
        } catch (err: any) {
            console.error('Error loading leaderboard:', err);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const handleClaimReward = async (sessionId: string) => {
        try {
            setClaimingIds(prev => new Set(prev).add(sessionId));

            const result = await gameService.claimReward(sessionId);

            if (result.success) {
                // Remove claimed reward from list
                setUnclaimedRewards(prev =>
                    prev.filter(reward => reward.id !== sessionId)
                );
            } else {
                setError(result.error || 'Failed to claim reward');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to claim reward');
        } finally {
            setClaimingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(sessionId);
                return newSet;
            });
        }
    };

    const handleSendNFT = (userId: string) => {

        navigate(`/nft/transfer/${userId}`);

    };

    const getRewardDisplayName = (rewardType?: string) => {
        if (!rewardType) return 'Unknown Reward';

        const rewardMap: { [key: string]: string } = {
            'DISCOUNT_20': '20% Discount',
            'DISCOUNT_40': '40% Discount',
            'NFT_DISCOUNT_5': '5% NFT Discount',
            'NFT_DISCOUNT_7': '7% NFT Discount',
            'AUTHOR_BADGE_DESIGNER': 'Designer Badge',
            'AUTHOR_BADGE_PRODUCER': 'Producer Badge'
        };

        return rewardMap[rewardType] || rewardType.replace(/_/g, ' ');
    };

    const getGameDisplayName = (gameType: string) => {
        const gameMap: { [key: string]: string } = {
            'COLOR_RUSH': 'Color Rush',
            'BPM_MATCHER': 'BPM Matcher'
        };

        return gameMap[gameType] || gameType;
    };

    const renderMedal = (rank: number) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}.`;
        }
    };

    const isCurrentUser = (userId: string) => {
        return currentUserId && userId === currentUserId;
    };

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

                        {/* Personal Best Score */}
                        <div className="personal-best">
                            <span className="best-score-label">Your Best:</span>
                            <span className="best-score-value">
                                {scoresLoading ? (
                                    <span className="loading-dots">...</span>
                                ) : bestScores.colorRush > 0 ? (
                                    `${bestScores.colorRush} pts`
                                ) : (
                                    'No score yet'
                                )}
                            </span>
                        </div>

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

                        {/* Personal Best Score */}
                        <div className="personal-best">
                            <span className="best-score-label">Your Best:</span>
                            <span className="best-score-value">
                                {scoresLoading ? (
                                    <span className="loading-dots">...</span>
                                ) : bestScores.bpmMatcher > 0 ? (
                                    `${bestScores.bpmMatcher} pts`
                                ) : (
                                    'No score yet'
                                )}
                            </span>
                        </div>

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

            <div className="games-menu-container-flex">
            {/* Global Leaderboard Section */}
            <div className="leaderboard-section">
                <h2>🏆 Global Leaderboard</h2>
                <div className="leaderboard-table">
                    <div className="table-header">
                        <span>Rank</span>
                        <span>Player</span>
                        <span>Total Score</span>
                        <span>Action</span>
                    </div>
                    <div className="table-body">
                        {leaderboardLoading ? (
                            <div className="loading-row">
                                <span>Loading leaderboard...</span>
                            </div>
                        ) : leaderboard.length > 0 ? (
                            leaderboard.map((entry) => (
                                <div key={`${entry.userId}-${entry.gameType}`} className="table-row">
                                    <span className="rank">
                                        {renderMedal(entry.rank)}
                                    </span>
                                    <span className="player-name">
                                        {entry.displayName || `Player ${entry.userId.substring(0, 8)}...`}
                                    </span>
                                    <span className="total-score">
                                        {entry.totalScore.toLocaleString()} pts
                                    </span>
                                    {!isCurrentUser(entry.userId) ? (<button
                                        className="nft-transfer-btn"
                                        onClick={() => handleSendNFT(entry.userId)}
                                        title="Send NFT to this player"
                                    >
                                        🎁 Send NFT
                                    </button> ) :
                                        (<button
                                        className="nft-transfer-btn disabled"
                                        disabled
                                        title="Cannot send NFT to yourself"
                                        >
                                        🎁 Send NFT
                                        </button>)}
                                </div>
                            ))
                        ) : (
                            <div className="no-data-row">
                                <span>No leaderboard data available</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Unclaimed Rewards Section */}
            {unclaimedRewards.length > 0 && (
                <div className="rewards-section">
                    <h2>🎁 Unclaimed Rewards</h2>
                    <div className="rewards-table">
                        <div className="table-header">
                            <span>Game</span>
                            <span>Score</span>
                            <span>Reward</span>
                            <span>Action</span>
                        </div>
                        <div className="table-body">
                            {unclaimedRewards.map((reward) => (
                                <div key={reward.id} className="table-row">
                                    <span className="game-name">
                                        {getGameDisplayName(reward.gameType)}
                                    </span>
                                    <span className="score">
                                        {reward.score} pts
                                    </span>
                                    <span className="reward-type">
                                        {getRewardDisplayName(reward.rewardType)}
                                    </span>
                                    <button
                                        className={`claim-btn ${claimingIds.has(reward.id) ? 'claiming' : ''}`}
                                        onClick={() => handleClaimReward(reward.id)}
                                        disabled={claimingIds.has(reward.id)}
                                    >
                                        {claimingIds.has(reward.id) ? 'Claiming...' : 'Claim Reward'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
            {/* Error Display */}
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)} className="dismiss-btn">×</button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading rewards...</p>
                </div>
            )}



            {/* Stats Section */}
            <div className="stats-section">
                <div className="stat-item-gm">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>
                            {statsLoading ? (
                                <span className="loading-dots">...</span>
                            ) : (
                                globalStats.activePlayers.toLocaleString()
                            )}
                        </h3>
                        <p>Active Players</p>
                    </div>
                </div>
                <div className="stat-item-gm">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>
                            {statsLoading ? (
                                <span className="loading-dots">...</span>
                            ) : (
                                globalStats.totalGamesPlayed.toLocaleString()
                            )}
                        </h3>
                        <p>Games Played</p>
                    </div>
                </div>
                <div className="stat-item-gm">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <h3>
                            {scoresLoading ? (
                                <span className="loading-dots">...</span>
                            ) : (
                                Math.max(bestScores.colorRush, bestScores.bpmMatcher)
                            )}
                        </h3>
                        <p>Your Best</p>
                    </div>
                </div>
                <div className="stat-item-gm">
                    <div className="stat-icon">🎁</div>
                    <div className="stat-content">
                        <h3>{unclaimedRewards.length}</h3>
                        <p>Your Rewards</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamesMenu;