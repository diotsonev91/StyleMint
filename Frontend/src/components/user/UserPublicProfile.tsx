// src/components/user/UserPublicProfile.tsx
import React, { useEffect, useState } from 'react';
import { userProfileService, UserStatsDTO } from '../../services/userProfileService';
import './UserProfile.css';
import {GameType} from "../../api/game.api"; // Отделни стилове за публичния профил

interface UserPublicProfileProps {
    userId: string;
    currentUserId?: string;
    displayName?: string;
    avatarUrl?: string;
    memberSince?: string;
}

const UserPublicProfile: React.FC<UserPublicProfileProps> = ({
                                                                 userId,
                                                                 currentUserId,
                                                                 displayName: initialDisplayName,
                                                                 avatarUrl: initialAvatarUrl,
                                                                 memberSince
                                                             }) => {
    const [stats, setStats] = useState<UserStatsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'gaming' | 'design' | 'audio'>('overview');

    const [displayName, setDisplayName] = useState(initialDisplayName || '');
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');

    const isOwnProfile = currentUserId && userId === currentUserId;

    useEffect(() => {
        fetchUserStats();
    }, [userId]);

    useEffect(() => {
        setDisplayName(initialDisplayName || '');
        setAvatarUrl(initialAvatarUrl || '');
    }, [initialDisplayName, initialAvatarUrl]);


    const fetchUserStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await userProfileService.getUserStats(userId);

            if (response.success && response.data) {
                // Филтрираме чувствителни данни за публичен профил
                const publicStats = {
                    ...response.data,
                    // Не показваме поръчки в публичен профил
                    orders: undefined,
                    // Не показваме email в gaming stats (ако има такова)
                    game: response.data.game ? {
                        ...response.data.game,
                        email: undefined // ако има
                    } : undefined
                };
                setStats(publicStats);
            } else {
                setError(response.error || 'Failed to load user statistics');
            }
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
            setError('Failed to load user statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="profile-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>Failed to Load Profile</h3>
                <p>{error}</p>
                <button onClick={fetchUserStats} className="retry-button">Try Again</button>
            </div>
        );
    }

    const hasGamingStats = stats.game && stats.game.gamesPlayed > 0;
    const hasDesignStats = stats.design && stats.design.totalDesigns > 0;
    const hasAudioStats = stats.audio && (stats.audio.totalSamples > 0 || stats.audio.totalPacks > 0);

    return (
        <div className="user-public-profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-banner">
                    <div className="banner-gradient"></div>
                </div>

                <div className="profile-main-info">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <img
                                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                                alt={displayName || 'User'}
                                className="avatar"
                            />
                        </div>
                    </div>

                    <div className="user-details">
                        <div className="username-row">
                            <h1>{displayName || 'User'}</h1>
                        </div>

                        {memberSince && (
                            <div className="user-meta">
                                <span className="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Joined {userProfileService.formatDate(memberSince)}
                                </span>
                            </div>
                        )}

                        <div className="roles-badges">
                            {hasGamingStats && (
                                <div className="role-badge" style={{ borderColor: '#ff6600' }}>
                                    <span className="role-icon">🎮</span>
                                    <span className="role-label">Gamer</span>
                                </div>
                            )}
                            {hasDesignStats && (
                                <div className="role-badge" style={{ borderColor: '#00c6ff' }}>
                                    <span className="role-icon">👕</span>
                                    <span className="role-label">Fashion Designer</span>
                                </div>
                            )}
                            {hasAudioStats && (
                                <div className="role-badge" style={{ borderColor: '#00ffaa' }}>
                                    <span className="role-icon">🎵</span>
                                    <span className="role-label">Audio Producer</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - БЕЗ orders tab */}
            <div className="profile-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Overview
                </button>

                {hasGamingStats && (
                    <button
                        className={`tab ${activeTab === 'gaming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gaming')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                        Gaming Stats
                    </button>
                )}

                {hasDesignStats && (
                    <button
                        className={`tab ${activeTab === 'design' ? 'active' : ''}`}
                        onClick={() => setActiveTab('design')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Fashion
                    </button>
                )}

                {hasAudioStats && (
                    <button
                        className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
                        onClick={() => setActiveTab('audio')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        Audio
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="profile-content">
                {activeTab === 'overview' && (
                    <div className="overview-grid">
                        {/* Created Content */}
                        <div className="stat-card">
                            <div className="stat-header">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <h3>Created Content</h3>
                            </div>
                            <div className="stat-body">
                                <div className="primary-stat">
                                    <span className="stat-label">Total Items</span>
                                    <span className="stat-value highlight">{stats.created.totalItems}</span>
                                </div>
                                <div className="stat-row">
                                    <div className="stat-item">
                                        <span className="label">Designs</span>
                                        <span className="value">{stats.created.totalDesigns}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">Samples</span>
                                        <span className="value">{stats.created.totalSamples}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="label">Packs</span>
                                        <span className="value">{stats.created.totalPacks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gaming Stats */}
                        {hasGamingStats && (
                            <div className="stat-card">
                                <div className="stat-header">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <h3>Gaming</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="primary-stat">
                                        <span className="stat-label">Top Score</span>
                                        <span className="stat-value highlight">{stats.game.totalScore.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <span className="label">Games Played</span>
                                            <span className="value">{stats.game.gamesPlayed}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">Unclaimed Rewards</span>
                                            <span className="value">{stats.game.unclaimedRewards}</span>
                                        </div>
                                    </div>
                                    {stats.game.lastPlayedAt && (
                                        <div className="stat-footer">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Last played: {userProfileService.formatDate(stats.game.lastPlayedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Останалите табове остават същите (gaming, design, audio) */}
                {/* но без бутони за action (claim rewards, play game, etc.) */}
                {/* и без чувствителна информация */}
            </div>

            {/* NFT Transfer Button (само ако не е собствения профил) */}
            {!isOwnProfile && (
                <div className="public-profile-actions">
                    <button
                        className="transfer-nft-btn"
                        onClick={() => {
                            // Тук ще пренасочваш към NFT трансфер формата
                            window.location.href = `/nft/transfer/${userId}`;
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        Send NFT to {displayName}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserPublicProfile;