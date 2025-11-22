// src/components/GameOverModal.tsx
// Shows immediately after game ends with score and reward info
// Updated with correct reward types from backend

import React from 'react';
import { GameSessionDTO, GameType } from '../../services/gameService';
import {RewardType} from "../../api/game.api";

interface GameOverModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameSession?: GameSessionDTO;
    onPlayAgain?: () => void;
    onClaimReward?: (sessionId: string) => void;
    claiming?: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         gameSession,
                                                         onPlayAgain,
                                                         onClaimReward,
                                                         claiming = false
                                                     }) => {
    if (!isOpen || !gameSession) return null;

    const hasReward = !!gameSession.rewardType;

    const getRewardInfo = (rewardType?: RewardType) => {
        switch (rewardType) {
            case RewardType.DISCOUNT_20:
                return {
                    icon: "🎟️",
                    text: "20% Discount",
                    color: "#10b981",
                    description: "On your next purchase!",
                    rarity: "Common"
                };

            case RewardType.DISCOUNT_40:
                return {
                    icon: "🎟️",
                    text: "40% Discount",
                    color: "#3b82f6",
                    description: "Amazing deal!",
                    rarity: "Rare"
                };

            case RewardType.NFT_DISCOUNT_5:
                return {
                    icon: "💎",
                    text: "5% NFT Discount",
                    color: "#8b5cf6",
                    description: "Permanent 5% off while you hold the NFT.",
                    rarity: "Epic"
                };

            case RewardType.NFT_DISCOUNT_7:
                return {
                    icon: "💎",
                    text: "7% NFT Discount",
                    color: "#a855f7",
                    description: "Permanent 7% off while you hold the NFT.",
                    rarity: "Epic"
                };

            case RewardType.AUTHOR_BADGE_DESIGNER:
                return {
                    icon: "🎨",
                    text: "Designer Badge",
                    color: "#f59e0b",
                    description: "Exclusive NFT badge for style designers.",
                    rarity: "Legendary"
                };

            case RewardType.AUTHOR_BADGE_PRODUCER:
                return {
                    icon: "🎵",
                    text: "Producer Badge",
                    color: "#fbbf24",
                    description: "Exclusive NFT badge for music producers.",
                    rarity: "Legendary"
                };

            default:
                return {
                    icon: "🏆",
                    text: "No Reward",
                    color: "#6b7280",
                    description: "Better luck next time!",
                    rarity: "None"
                };
        }
    };


    const getGameInfo = (gameType?: GameType) => {
        switch (gameType) {
            case GameType.COLOR_RUSH:
                return {
                    icon: '🏃',
                    name: 'Color Rush',
                    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
                };
            case GameType.BPM_MATCHER:
                return {
                    icon: '🎵',
                    name: 'BPM Matcher',
                    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)'
                };
            default:
                return {
                    icon: '🎮',
                    name: 'Game',
                    gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
                };
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'Common': return '#10b981';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#8b5cf6';
            case 'Legendary': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const reward = getRewardInfo(gameSession.rewardType);
    const game = getGameInfo(gameSession.gameType);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    animation: 'fadeIn 0.3s ease-out'
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10000,
                    width: '90%',
                    maxWidth: '500px',
                    animation: 'slideUp 0.4s ease-out'
                }}
            >
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        borderRadius: '24px',
                        padding: '40px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '150px',
                            background: game.gradient,
                            opacity: 0.15,
                            borderRadius: '24px 24px 0 0'
                        }}
                    />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '24px',
                            transition: 'all 0.2s ease',
                            zIndex: 1
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                    >
                        ×
                    </button>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Game Icon */}
                        <div
                            style={{
                                fontSize: '64px',
                                textAlign: 'center',
                                marginBottom: '20px',
                                animation: 'bounce 1s ease-in-out'
                            }}
                        >
                            {game.icon}
                        </div>

                        {/* Title */}
                        <h2
                            style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: 'white',
                                textAlign: 'center',
                                margin: '0 0 10px 0',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            Game Over!
                        </h2>

                        {/* Game Name */}
                        <p
                            style={{
                                fontSize: '16px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                textAlign: 'center',
                                margin: '0 0 30px 0'
                            }}
                        >
                            {game.name}
                        </p>

                        {/* Score */}
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: '600'
                                }}
                            >
                                Your Score
                            </div>
                            <div
                                style={{
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    color: '#fbbf24',
                                    textAlign: 'center',
                                    textShadow: '0 4px 20px rgba(251, 191, 36, 0.4)'
                                }}
                            >
                                {gameSession.score?.toLocaleString()}
                            </div>
                            {gameSession.durationSeconds && (
                                <div
                                    style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        textAlign: 'center',
                                        marginTop: '8px'
                                    }}
                                >
                                    Duration: {Math.floor(gameSession.durationSeconds / 60)}:
                                    {(gameSession.durationSeconds % 60).toString().padStart(2, '0')}
                                </div>
                            )}
                        </div>

                        {/* Reward Section */}
                        {hasReward ? (
                            <div
                                style={{
                                    background: `linear-gradient(135deg, ${reward.color}20, ${reward.color}10)`,
                                    border: `2px solid ${reward.color}40`,
                                    borderRadius: '16px',
                                    padding: '24px',
                                    marginBottom: '24px',
                                    animation: 'pulse 2s ease-in-out infinite',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Rarity Badge */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: getRarityColor(reward.rarity),
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        boxShadow: `0 2px 10px ${getRarityColor(reward.rarity)}40`
                                    }}
                                >
                                    ⭐ {reward.rarity}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        marginBottom: '16px',
                                        paddingTop: '8px'
                                    }}
                                >
                  <span
                      style={{
                          fontSize: '48px',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                          animation: 'float 3s ease-in-out infinite'
                      }}
                  >
                    {reward.icon}
                  </span>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            fontWeight: '600',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        🎉 You Earned
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            color: reward.color,
                                            marginBottom: '8px',
                                            textShadow: `0 2px 10px ${reward.color}40`
                                        }}
                                    >
                                        {reward.text}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        {reward.description}
                                    </div>
                                </div>

                                {!gameSession.rewardClaimed && onClaimReward && (
                                    <button
                                        onClick={() => onClaimReward(gameSession.id)}
                                        disabled={claiming}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            marginTop: '20px',
                                            background: claiming
                                                ? 'rgba(255, 255, 255, 0.1)'
                                                : reward.color,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: claiming ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: claiming ? 'none' : `0 4px 20px ${reward.color}40`
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!claiming) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = `0 6px 30px ${reward.color}60`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = `0 4px 20px ${reward.color}40`;
                                        }}
                                    >
                                        {claiming ? '⏳ Claiming...' : '🎁 Claim Reward Now'}
                                    </button>
                                )}

                                {gameSession.rewardClaimed && (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '16px',
                                            marginTop: '20px',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            border: '2px solid rgba(16, 185, 129, 0.4)',
                                            borderRadius: '12px',
                                            color: '#10b981',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ✅ Reward Already Claimed!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    marginBottom: '24px'
                                }}
                            >
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
                                <div
                                    style={{
                                        fontSize: '16px',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontWeight: '600',
                                        marginBottom: '6px'
                                    }}
                                >
                                    No reward this time
                                </div>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}
                                >
                                    Keep playing to earn amazing rewards!
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {onPlayAgain && (
                                <button
                                    onClick={onPlayAgain}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        background: game.gradient,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
                                    }}
                                >
                                    🔄 Play Again
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                🏠 Main Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
            </style>
        </>
    );
};

export default GameOverModal;