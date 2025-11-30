// src/components/user/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { userProfileService, UserStatsDTO } from '../../services/userProfileService';
import './UserProfile.css';
import {GameType, RewardType} from "../../api/game.api";
import {MyClothDesignsPage} from "../../pages/Clothes/MyClothDesignsPage";

interface UserProfileProps {
    userId: string;
    currentUserId?: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    memberSince?: string;
    onProfileUpdate?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
                                                     userId,
                                                     currentUserId,
                                                     displayName: initialDisplayName,
                                                     email,
                                                     avatarUrl: initialAvatarUrl,
                                                     memberSince,
                                                     onProfileUpdate
                                                 }) => {
    const [stats, setStats] = useState<UserStatsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'gaming' | 'design' | 'audio' | 'orders'>('overview');

    // Edit states
    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [displayName, setDisplayName] = useState(initialDisplayName || '');
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDesignsPage, setShowDesignsPage] = useState(false);
    const isOwnProfile = currentUserId && userId === currentUserId;

    useEffect(() => {
        fetchUserStats();
    }, [userId]);

    useEffect(() => {
        setDisplayName(initialDisplayName || '');
        setAvatarUrl(initialAvatarUrl || '');
    }, [initialDisplayName, initialAvatarUrl]);


    // Helper functions for gaming stats
    const getGameTypeIcon = (gameType: GameType): string => {
        switch (gameType) {
            case GameType.COLOR_RUSH:
                return '🎨';
            case GameType.BPM_MATCHER:
                return '🎵';
            default:
                return '🎮';
        }
    };

    const formatGameType = (gameType: GameType): string => {
        switch (gameType) {
            case GameType.COLOR_RUSH:
                return 'Color Rush';
            case GameType.BPM_MATCHER:
                return 'BPM Matcher';
            default:
                return gameType;
        }
    };

    const getRewardIcon = (rewardType: RewardType): string => {
        switch (rewardType) {
            case RewardType.DISCOUNT_20:
            case RewardType.DISCOUNT_40:
                return '💸';
            case RewardType.NFT_DISCOUNT_5:
            case RewardType.NFT_DISCOUNT_7:
                return '🖼️';
            case RewardType.AUTHOR_BADGE_DESIGNER:
                return '👕';
            case RewardType.AUTHOR_BADGE_PRODUCER:
                return '🎵';
            default:
                return '🎁';
        }
    };

    const formatRewardType = (rewardType: RewardType): string => {
        switch (rewardType) {
            case RewardType.DISCOUNT_20:
                return '20% Discount';
            case RewardType.DISCOUNT_40:
                return '40% Discount';
            case RewardType.NFT_DISCOUNT_5:
                return 'NFT 5% Discount';
            case RewardType.NFT_DISCOUNT_7:
                return 'NFT 7% Discount';
            case RewardType.AUTHOR_BADGE_DESIGNER:
                return 'Designer Badge';
            case RewardType.AUTHOR_BADGE_PRODUCER:
                return 'Producer Badge';
            default:
                return rewardType;
        }
    };

// За сега връща dummy данни - ще трябва да extend-неш DTO-то за детайлни статистики
    const getGameTypeStats = (gameType: GameType) => {
        return {
            gamesPlayed: 'N/A',
            bestScore: 'N/A',
            averageScore: 'N/A'
        };
    };
    const fetchUserStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await userProfileService.getUserStats(userId);

            if (response.success && response.data) {
                setStats(response.data);
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

    const handleUpdateDisplayName = async () => {
        if (!newDisplayName.trim()) {
            setUpdateError('Display name cannot be empty');
            return;
        }

        if (newDisplayName.trim().length < 2) {
            setUpdateError('Display name must be at least 2 characters long');
            return;
        }

        setUpdateLoading(true);
        setUpdateError(null);
        setSuccessMessage(null);

        const response = await userProfileService.updateDisplayName(userId, newDisplayName.trim());

        setUpdateLoading(false);

        if (response.success) {
            setDisplayName(newDisplayName.trim());
            setIsEditingDisplayName(false);
            setSuccessMessage('Display name updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } else {
            setUpdateError(response.error || 'Failed to update display name');
        }
    };

    const handleUpdateAvatar = async () => {
        if (!newAvatarUrl.trim()) {
            setUpdateError('Avatar URL cannot be empty');
            return;
        }

        try {
            new URL(newAvatarUrl.trim());
        } catch {
            setUpdateError('Please enter a valid URL');
            return;
        }

        setUpdateLoading(true);
        setUpdateError(null);
        setSuccessMessage(null);

        const response = await userProfileService.updateAvatar(userId, newAvatarUrl.trim());

        setUpdateLoading(false);

        if (response.success) {
            setAvatarUrl(newAvatarUrl.trim());
            setIsEditingAvatar(false);
            setSuccessMessage('Avatar updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } else {
            setUpdateError(response.error || 'Failed to update avatar');
        }
    };

    const startEditingDisplayName = () => {
        setNewDisplayName(displayName);
        setIsEditingDisplayName(true);
        setUpdateError(null);
    };

    const cancelEditingDisplayName = () => {
        setIsEditingDisplayName(false);
        setNewDisplayName('');
        setUpdateError(null);
    };

    const startEditingAvatar = () => {
        setNewAvatarUrl(avatarUrl);
        setIsEditingAvatar(true);
        setUpdateError(null);
    };

    const cancelEditingAvatar = () => {
        setIsEditingAvatar(false);
        setNewAvatarUrl('');
        setUpdateError(null);
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
    const hasOrderStats = stats.orders && (stats.orders.totalOrders > 0 || stats.orders.serviceAvailable === false);

    return (
        <div className="user-profile-container">
            {successMessage && (
                <div className="success-notification">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {updateError && (
                <div className="error-notification">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{updateError}</span>
                </div>
            )}

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
                            {isOwnProfile && !isEditingAvatar && (
                                <button
                                    className="edit-avatar-btn"
                                    onClick={startEditingAvatar}
                                    title="Edit avatar"
                                >
                                    edit avatar
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {isEditingAvatar && (
                            <div className="edit-modal">
                                <h3>Update Avatar</h3>
                                <input
                                    type="text"
                                    value={newAvatarUrl}
                                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                                    placeholder="Enter avatar URL"
                                    className="edit-input"
                                    disabled={updateLoading}
                                />
                                <div className="edit-actions">
                                    <button
                                        onClick={handleUpdateAvatar}
                                        className="btn-save"
                                        disabled={updateLoading}
                                    >
                                        {updateLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={cancelEditingAvatar}
                                        className="btn-cancel"
                                        disabled={updateLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="user-details">
                        <div className="username-row">
                            {!isEditingDisplayName ? (
                                <>
                                    <h1>{displayName || 'User'}</h1>
                                    {isOwnProfile && (
                                        <button
                                            className="edit-btn-profile"
                                            onClick={startEditingDisplayName}
                                            title="Edit display name"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Edit display name
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="edit-inline">
                                    <input
                                        type="text"
                                        value={newDisplayName}
                                        onChange={(e) => setNewDisplayName(e.target.value)}
                                        className="edit-input-inline-user"
                                        placeholder="Enter display name"
                                        disabled={updateLoading}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleUpdateDisplayName}
                                        className="btn-save-small"
                                        disabled={updateLoading}
                                    >
                                        {updateLoading ? '...' : '✓'}
                                    </button>
                                    <button
                                        onClick={cancelEditingDisplayName}
                                        className="btn-cancel-small"
                                        disabled={updateLoading}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {email && <p className="user-email">{email}</p>}

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

            {/* Tabs */}
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

                {hasOrderStats && (
                    <button
                        className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Orders
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
                {activeTab === 'audio' && (
                    <div className="audio-stats-container">
                        {/* Audio Header */}
                        <div className="audio-header">
                            <div className="audio-title">
                                <h2>🎵 Audio Production</h2>
                                <p>Overview of your audio sample and pack production statistics</p>
                            </div>
                        </div>

                        {/* Main Stats Grid */}
                        <div className="audio-stats-grid">
                            {/* Portfolio Overview */}
                            <div className="stat-card audio-card">
                                <div className="stat-header">
                                    <div className="stat-icon">📊</div>
                                    <h3>Portfolio Overview</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="primary-stat">
                                        <span className="stat-label">Total Content</span>
                                        <span className="stat-value highlight">{stats.audio.totalSamples + stats.audio.totalPacks}</span>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <span className="label">Samples</span>
                                            <span className="value">{stats.audio.totalSamples}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">Packs</span>
                                            <span className="value">{stats.audio.totalPacks}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Performance */}
                            <div className="stat-card audio-card">
                                <div className="stat-header">
                                    <div className="stat-icon">💰</div>
                                    <h3>Sales Performance</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="primary-stat">
                                        <span className="stat-label">Total Sales</span>
                                        <span className="stat-value highlight">{stats.audio.totalSales}</span>
                                    </div>
                                    <div className="revenue-section">
                                        <div className="revenue-label">Total Revenue</div>
                                        <div className="revenue-amount">
                                            {userProfileService.formatCurrency(stats.audio.revenue)}
                                        </div>
                                        {stats.audio.totalSales > 0 && (
                                            <div className="average-sale">
                                                <span>Average per item: </span>
                                                <span className="average-amount">
                                    {userProfileService.formatCurrency(stats.audio.revenue / stats.audio.totalSales)}
                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Breakdown */}
                            <div className="stat-card audio-card">
                                <div className="stat-header">
                                    <div className="stat-icon">📈</div>
                                    <h3>Content Breakdown</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="activity-stats">
                                        <div className="activity-item">
                                            <div className="activity-icon">🎵</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Audio Samples</span>
                                                <span className="activity-value">{stats.audio.totalSamples}</span>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon">📦</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Sample Packs</span>
                                                <span className="activity-value">{stats.audio.totalPacks}</span>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon">💵</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Total Revenue</span>
                                                <span className="activity-value">{userProfileService.formatCurrency(stats.audio.revenue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="orders-stats-container">
                        {/* Orders Header */}
                        <div className="orders-header">
                            <div className="orders-title">
                                <h2>🛒 Order History</h2>
                                <p>Overview of your purchases and spending</p>
                            </div>
                        </div>

                        {/* Check if order service is available */}
                        {stats.orders.serviceAvailable === false ? (
                            <div className="service-unavailable-section">
                                <div className="unavailable-card">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="unavailable-icon">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="unavailable-title">Order History Temporarily Unavailable</h3>
                                    <p className="unavailable-description">
                                        We're currently updating our order system. Your order history will be available shortly.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="orders-stats-grid">
                                {/* Total Orders */}
                                <div className="stat-card orders-card">
                                    <div className="stat-header">
                                        <div className="stat-icon">📦</div>
                                        <h3>Total Orders</h3>
                                    </div>
                                    <div className="stat-body">
                                        <div className="primary-stat">
                                            <span className="stat-label">Orders Placed</span>
                                            <span className="stat-value highlight">{stats.orders.totalOrders}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Spent */}
                                <div className="stat-card orders-card">
                                    <div className="stat-header">
                                        <div className="stat-icon">💰</div>
                                        <h3>Total Spending</h3>
                                    </div>
                                    <div className="stat-body">
                                        <div className="primary-stat">
                                            <span className="stat-label">Total Spent</span>
                                            <span className="stat-value highlight">{userProfileService.formatCurrency(stats.orders.totalSpent)}</span>
                                        </div>
                                        {stats.orders.totalOrders > 0 && (
                                            <div className="average-order">
                                                <span className="average-label">Average per order:</span>
                                                <span className="average-value">
                                    {userProfileService.formatCurrency(stats.orders.totalSpent / stats.orders.totalOrders)}
                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Activity */}
                                <div className="stat-card orders-card">
                                    <div className="stat-header">
                                        <div className="stat-icon">📊</div>
                                        <h3>Order Activity</h3>
                                    </div>
                                    <div className="stat-body">
                                        <div className="activity-stats">
                                            <div className="activity-item">
                                                <div className="activity-icon">🛍️</div>
                                                <div className="activity-info">
                                                    <span className="activity-label">Total Orders</span>
                                                    <span className="activity-value">{stats.orders.totalOrders}</span>
                                                </div>
                                            </div>
                                            <div className="activity-item">
                                                <div className="activity-icon">💵</div>
                                                <div className="activity-info">
                                                    <span className="activity-label">Total Spent</span>
                                                    <span className="activity-value">{userProfileService.formatCurrency(stats.orders.totalSpent)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'gaming' && (
                    <div className="gaming-stats-container">
                        {/* Gaming Header */}
                        <div className="gaming-header">
                            <div className="gaming-title">
                                <h2>🎮 Gaming Statistics</h2>
                                <p>Detailed overview of your gaming performance and achievements</p>
                            </div>
                            {stats.game.lastRewardType && (
                                <div className="last-reward-badge">
                                    <div className="reward-icon">
                                        {getRewardIcon(stats.game.lastRewardType)}
                                    </div>
                                    <div className="reward-info">
                                        <span className="reward-label">Last Reward</span>
                                        <span className="reward-name">{formatRewardType(stats.game.lastRewardType)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Stats Grid */}
                        <div className="gaming-stats-grid">
                            {/* Overall Performance */}
                            <div className="stat-card gaming-card">
                                <div className="stat-header">
                                    <div className="stat-icon">🏆</div>
                                    <h3>Overall Performance</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="primary-stat">
                                        <span className="stat-label">Total Score</span>
                                        <span className="stat-value highlight">{stats.game.totalScore.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <span className="label">Games Played</span>
                                            <span className="value">{stats.game.gamesPlayed}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="label">Unclaimed Rewards</span>
                                            <span className="value reward-count">{stats.game.unclaimedRewards}</span>
                                        </div>
                                    </div>
                                    <div className="stat-footer">
                                        <div className="rank-display">
                                            <span className="rank-label">Global Rank</span>
                                            <span className="rank-value">#{stats.game.totalRank || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Game Types Breakdown */}
                            <div className="stat-card gaming-card">
                                <div className="stat-header">
                                    <div className="stat-icon">🎯</div>
                                    <h3>Game Types</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="games-list">
                                        {Array.from(stats.game.gameTypes).map((gameType) => (
                                            <div key={gameType} className="game-type-item">
                                                <div className="game-info">
                                    <span className="game-icon">
                                        {getGameTypeIcon(gameType)}
                                    </span>
                                                    <span className="game-name">{formatGameType(gameType)}</span>
                                                </div>
                                                <div className="game-rank">
                                    <span className="rank-badge">
                                        #{stats.game.ranks?.[gameType] || 'N/A'}
                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {stats.game.gameTypes.size === 0 && (
                                            <div className="no-games">
                                                <span>No games played yet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="stat-card gaming-card">
                                <div className="stat-header">
                                    <div className="stat-icon">📊</div>
                                    <h3>Recent Activity</h3>
                                </div>
                                <div className="stat-body">
                                    {stats.game.lastPlayedAt ? (
                                        <>
                                            <div className="activity-item">
                                                <div className="activity-icon">🕒</div>
                                                <div className="activity-info">
                                                    <span className="activity-label">Last Played</span>
                                                    <span className="activity-value">
                                        {userProfileService.formatDate(stats.game.lastPlayedAt)}
                                    </span>
                                                </div>
                                            </div>
                                            {stats.game.lastRewardType && (
                                                <div className="activity-item">
                                                    <div className="activity-icon">🎁</div>
                                                    <div className="activity-info">
                                                        <span className="activity-label">Last Reward</span>
                                                        <span className="activity-value reward">
                                            {formatRewardType(stats.game.lastRewardType)}
                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-activity">
                                            <span>No recent activity</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {isOwnProfile && (
                                <div className="stat-card gaming-card">
                                    <div className="stat-header">
                                        <div className="stat-icon">⚡</div>
                                        <h3>Quick Actions</h3>
                                    </div>
                                    <div className="stat-body">
                                        <div className="action-buttons">
                                            <button className="action-btn primary">
                                                <span className="btn-icon">🎮</span>
                                                <span>Play Game</span>
                                            </button>
                                            {stats.game.unclaimedRewards > 0 && (
                                                <button className="action-btn secondary">
                                                    <span className="btn-icon">🎁</span>
                                                    <span>Claim Rewards ({stats.game.unclaimedRewards})</span>
                                                </button>
                                            )}
                                            <button className="action-btn outline">
                                                <span className="btn-icon">📈</span>
                                                <span>View Leaderboard</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detailed Game Stats */}
                        {stats.game.gameTypes.size > 0 && (
                            <div className="detailed-stats-section">
                                <h3>Detailed Game Statistics</h3>
                                <div className="game-details-grid">
                                    {Array.from(stats.game.gameTypes).map((gameType) => (
                                        <div key={gameType} className="game-detail-card">
                                            <div className="game-detail-header">
                                                <div className="game-detail-icon">
                                                    {getGameTypeIcon(gameType)}
                                                </div>
                                                <h4>{formatGameType(gameType)}</h4>
                                                <div className="game-rank-badge">
                                                    Rank #{stats.game.ranks?.[gameType] || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="game-detail-body">
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Games Played</span>
                                                    <span className="game-stat-value">
                                        {/* Тук може да добавиш специфични статистики за всеки game type */}
                                                        {getGameTypeStats(gameType).gamesPlayed || 'N/A'}
                                    </span>
                                                </div>
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Best Score</span>
                                                    <span className="game-stat-value">
                                        {getGameTypeStats(gameType).bestScore || 'N/A'}
                                    </span>
                                                </div>
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Average Score</span>
                                                    <span className="game-stat-value">
                                        {getGameTypeStats(gameType).averageScore || 'N/A'}
                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'design' && (
                    <div className="design-stats-container">
                        {/* Design Header */}
                        <div className="design-header">
                            <div className="design-title">
                                <h2>👕 Fashion Designs</h2>
                                <p>Overview of your fashion design portfolio and performance</p>
                            </div>
                            <div className="design-actions">
                                <button
                                    className="view-designs-btn"
                                    onClick={() => setShowDesignsPage(!showDesignsPage)}
                                >
                                    <span>{showDesignsPage ? 'Hide' : 'View'} My Designs</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        className={`arrow-icon ${showDesignsPage ? 'rotated' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* My Designs Page - Toggle Section */}
                        {showDesignsPage && (
                            <div className="designs-page-section">
                                {currentUserId === userId ?
                                    <MyClothDesignsPage />
                                    :
                                <MyClothDesignsPage
                                    userId={userId}
                                    isEmbedded={true}
                                    onClose={() => setShowDesignsPage(false)}
                                />
                        }
                            </div>
                        )}

                        {/* Main Stats Grid */}
                        <div className="design-stats-grid">
                            {/* Portfolio Overview */}
                            <div className="stat-card design-card">
                                <div className="stat-header">
                                    <div className="stat-icon">📊</div>
                                    <h3>Portfolio Overview</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="primary-stat">
                                        <span className="stat-label">Total Designs</span>
                                        <span className="stat-value highlight">{stats.design.totalDesigns}</span>
                                    </div>
                                    <div className="design-breakdown">
                                        <div className="design-type public">
                                            <div className="type-indicator"></div>
                                            <div className="type-info">
                                                <span className="type-label">Public Designs</span>
                                                <span className="type-count">{stats.design.publicDesigns || 0}</span>
                                            </div>
                                        </div>
                                        <div className="design-type private">
                                            <div className="type-indicator"></div>
                                            <div className="type-info">
                                                <span className="type-label">Private Designs</span>
                                                <span className="type-count">{stats.design.privateDesigns || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Performance */}
                            {(stats.design.totalSales !== undefined || stats.design.revenue !== undefined) && (
                                <div className="stat-card design-card">
                                    <div className="stat-header">
                                        <div className="stat-icon">💰</div>
                                        <h3>Sales Performance</h3>
                                    </div>
                                    <div className="stat-body">
                                        {stats.design.totalSales !== undefined && (
                                            <div className="primary-stat">
                                                <span className="stat-label">Total Sales</span>
                                                <span className="stat-value highlight">{stats.design.totalSales}</span>
                                            </div>
                                        )}
                                        {stats.design.revenue !== undefined && (
                                            <div className="revenue-section">
                                                <div className="revenue-label">Total Revenue</div>
                                                <div className="revenue-amount">
                                                    {userProfileService.formatCurrency(stats.design.revenue)}
                                                </div>
                                                {stats.design.totalSales > 0 && (
                                                    <div className="average-sale">
                                                        <span>Average per design: </span>
                                                        <span className="average-amount">
                                            {userProfileService.formatCurrency(stats.design.revenue / stats.design.totalSales)}
                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {(!stats.design.totalSales && !stats.design.revenue) && (
                                            <div className="no-sales">
                                                <div className="no-sales-icon">🛒</div>
                                                <span>No sales yet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Design Activity */}
                            <div className="stat-card design-card">
                                <div className="stat-header">
                                    <div className="stat-icon">📈</div>
                                    <h3>Design Activity</h3>
                                </div>
                                <div className="stat-body">
                                    <div className="activity-stats">
                                        <div className="activity-item">
                                            <div className="activity-icon">👁️</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Public Designs</span>
                                                <span className="activity-value">{stats.design.publicDesigns || 0}</span>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon">🔒</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Private Designs</span>
                                                <span className="activity-value">{stats.design.privateDesigns || 0}</span>
                                            </div>
                                        </div>
                                        <div className="activity-item">
                                            <div className="activity-icon">📦</div>
                                            <div className="activity-info">
                                                <span className="activity-label">Total Created</span>
                                                <span className="activity-value">{stats.design.totalDesigns}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;