// src/components/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import './UserProfile.css';

interface UserStats {
  totalGamesPlayed: number;
  highScore: number;
  rank: number;
  totalPlayTime: string;
}

interface UserRole {
  isSoundProducer: boolean;
  isClothProducer: boolean;
  isNFTProducer: boolean;
  isGamer: boolean;
}

interface SoundPack {
  id: number;
  name: string;
  downloads: number;
  rating: number;
}

interface ClothItem {
  id: number;
  name: string;
  sales: number;
  imageUrl: string;
}

interface NFTItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface UserProfileData {
  username: string;
  email: string;
  avatarUrl: string;
  joinDate: string;
  isActive: boolean;
  roles: UserRole;
  stats?: UserStats;
  soundPacks?: SoundPack[];
  clothItems?: ClothItem[];
  nftItems?: NFTItem[];
  bio?: string;
}

interface UserProfileProps {
  userId?: number;
  backendUrl?: string;
  authToken?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  backendUrl = 'http://localhost:8080',
  authToken = ''
}) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sounds' | 'cloth' | 'nft' | 'gaming'>('overview');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const endpoint = userId 
        ? `${backendUrl}/api/users/${userId}/profile`
        : `${backendUrl}/api/users/me/profile`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

     // const response = await fetch(endpoint, { headers });

    //   if (response.ok) {
    //     const data = await response.json();
    //     setProfile(data);
    //   } else 
        {
        // Mock data for development
        setProfile({
          username: 'ProGamer2024',
          email: 'progamer@stylemint.com',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer2024',
          joinDate: '2024-01-15',
          isActive: true,
          bio: 'Music producer, NFT artist, and competitive gamer. Creating unique sound experiences and digital fashion.',
          roles: {
            isSoundProducer: true,
            isClothProducer: true,
            isNFTProducer: true,
            isGamer: true
          },
          stats: {
            totalGamesPlayed: 147,
            highScore: 15420,
            rank: 3,
            totalPlayTime: '42h 15m'
          },
          soundPacks: [
            { id: 1, name: 'Cyberpunk Beats Vol.1', downloads: 1250, rating: 4.8 },
            { id: 2, name: 'Retro Wave Collection', downloads: 890, rating: 4.6 },
            { id: 3, name: 'Neon Dreams Soundtrack', downloads: 2100, rating: 4.9 }
          ],
          clothItems: [
            { id: 1, name: 'Neon Hoodie', sales: 45, imageUrl: 'https://via.placeholder.com/150/00ffaa/000000?text=Hoodie' },
            { id: 2, name: 'Cyber Jacket', sales: 32, imageUrl: 'https://via.placeholder.com/150/00c6ff/000000?text=Jacket' },
            { id: 3, name: 'Pixel T-Shirt', sales: 67, imageUrl: 'https://via.placeholder.com/150/ff00aa/000000?text=Tshirt' }
          ],
          nftItems: [
            { id: 1, name: 'Digital Avatar #001', price: 0.5, imageUrl: 'https://via.placeholder.com/150/ff00ff/000000?text=NFT1' },
            { id: 2, name: 'Cyber Pet #042', price: 0.3, imageUrl: 'https://via.placeholder.com/150/00ffff/000000?text=NFT2' },
            { id: 3, name: 'Neon Art Piece', price: 1.2, imageUrl: 'https://via.placeholder.com/150/ffff00/000000?text=NFT3' }
          ]
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
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

  if (error || !profile) {
    return (
      <div className="profile-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Failed to Load Profile</h3>
        <p>{error}</p>
        <button onClick={fetchUserProfile} className="retry-button">Try Again</button>
      </div>
    );
  }

  const getRolesBadges = () => {
    const badges = [];
    if (profile.roles.isSoundProducer) {
      badges.push({ label: 'Sound Producer', icon: '🎵', color: '#00ffaa' });
    }
    if (profile.roles.isClothProducer) {
      badges.push({ label: 'Fashion Designer', icon: '👕', color: '#00c6ff' });
    }
    if (profile.roles.isNFTProducer) {
      badges.push({ label: 'NFT Artist', icon: '🎨', color: '#ff00ff' });
    }
    if (profile.roles.isGamer) {
      badges.push({ label: 'Gamer', icon: '🎮', color: '#ff6600' });
    }
    return badges;
  };

  return (
    <div className="user-profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner">
          <div className="banner-gradient"></div>
        </div>

        <div className="profile-main-info">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={profile.avatarUrl} alt={profile.username} className="avatar" />
              <div className={`status-indicator ${profile.isActive ? 'active' : 'inactive'}`}>
                <span className="status-dot"></span>
                <span className="status-text">{profile.isActive ? 'Active' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="user-details">
            <div className="username-row">
              <h1>{profile.username}</h1>
              {profile.isActive && (
                <span className="active-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active
                </span>
              )}
            </div>

            <p className="user-email">{profile.email}</p>
            
            {profile.bio && (
              <p className="user-bio">{profile.bio}</p>
            )}

            <div className="user-meta">
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Role Badges */}
            <div className="roles-badges">
              {getRolesBadges().map((badge, index) => (
                <div 
                  key={index} 
                  className="role-badge"
                  style={{ borderColor: badge.color }}
                >
                  <span className="role-icon">{badge.icon}</span>
                  <span className="role-label">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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

        {profile.roles.isSoundProducer && (
          <button 
            className={`tab ${activeTab === 'sounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('sounds')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Sound Packs
          </button>
        )}

        {profile.roles.isClothProducer && (
          <button 
            className={`tab ${activeTab === 'cloth' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloth')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Fashion
          </button>
        )}

        {profile.roles.isNFTProducer && (
          <button 
            className={`tab ${activeTab === 'nft' ? 'active' : ''}`}
            onClick={() => setActiveTab('nft')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            NFT Collection
          </button>
        )}

        {profile.roles.isGamer && (
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
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-grid">
            {profile.roles.isGamer && profile.stats && (
              <div className="stat-card">
                <div className="stat-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h3>Gaming Achievement</h3>
                </div>
                <div className="stat-body">
                  <div className="primary-stat">
                    <span className="stat-label">Top Score</span>
                    <span className="stat-value highlight">{profile.stats.highScore.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="label">Global Rank</span>
                      <span className="value">#{profile.stats.rank}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Games Played</span>
                      <span className="value">{profile.stats.totalGamesPlayed}</span>
                    </div>
                  </div>
                  <div className="stat-footer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Total Play Time: {profile.stats.totalPlayTime}</span>
                  </div>
                </div>
              </div>
            )}

            {profile.roles.isSoundProducer && profile.soundPacks && (
              <div className="stat-card">
                <div className="stat-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <h3>Sound Production</h3>
                </div>
                <div className="stat-body">
                  <div className="primary-stat">
                    <span className="stat-label">Total Packs</span>
                    <span className="stat-value">{profile.soundPacks.length}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="label">Total Downloads</span>
                      <span className="value">{profile.soundPacks.reduce((sum, pack) => sum + pack.downloads, 0).toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Avg Rating</span>
                      <span className="value">⭐ {(profile.soundPacks.reduce((sum, pack) => sum + pack.rating, 0) / profile.soundPacks.length).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profile.roles.isClothProducer && profile.clothItems && (
              <div className="stat-card">
                <div className="stat-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3>Fashion Designs</h3>
                </div>
                <div className="stat-body">
                  <div className="primary-stat">
                    <span className="stat-label">Items Created</span>
                    <span className="stat-value">{profile.clothItems.length}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="label">Total Sales</span>
                      <span className="value">{profile.clothItems.reduce((sum, item) => sum + item.sales, 0)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Best Seller</span>
                      <span className="value">{Math.max(...profile.clothItems.map(item => item.sales))} sold</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profile.roles.isNFTProducer && profile.nftItems && (
              <div className="stat-card">
                <div className="stat-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <h3>NFT Collection</h3>
                </div>
                <div className="stat-body">
                  <div className="primary-stat">
                    <span className="stat-label">NFTs Created</span>
                    <span className="stat-value">{profile.nftItems.length}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="label">Floor Price</span>
                      <span className="value">{Math.min(...profile.nftItems.map(item => item.price))} ETH</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Highest Price</span>
                      <span className="value">{Math.max(...profile.nftItems.map(item => item.price))} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sound Packs Tab */}
        {activeTab === 'sounds' && profile.soundPacks && (
          <div className="items-grid">
            {profile.soundPacks.map(pack => (
              <div key={pack.id} className="sound-pack-card">
                <div className="pack-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h4>{pack.name}</h4>
                <div className="pack-stats">
                  <span className="downloads">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {pack.downloads.toLocaleString()}
                  </span>
                  <span className="rating">⭐ {pack.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cloth Items Tab */}
        {activeTab === 'cloth' && profile.clothItems && (
          <div className="items-grid">
            {profile.clothItems.map(item => (
              <div key={item.id} className="cloth-item-card">
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="sales">{item.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NFT Items Tab */}
        {activeTab === 'nft' && profile.nftItems && (
          <div className="items-grid">
            {profile.nftItems.map(item => (
              <div key={item.id} className="nft-item-card">
                <div className="nft-image">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="nft-badge">NFT</div>
                </div>
                <div className="nft-info">
                  <h4>{item.name}</h4>
                  <p className="price">{item.price} ETH</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gaming Stats Tab */}
        {activeTab === 'gaming' && profile.stats && (
          <div className="gaming-stats-detailed">
            <div className="stats-hero">
              <div className="hero-stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                </svg>
                <div>
                  <h2>{profile.stats.highScore.toLocaleString()}</h2>
                  <p>Top Score</p>
                </div>
              </div>
              
              <div className="hero-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div>
                  <h2>#{profile.stats.rank}</h2>
                  <p>Global Rank</p>
                </div>
              </div>

              <div className="hero-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h2>{profile.stats.totalGamesPlayed}</h2>
                  <p>Games Played</p>
                </div>
              </div>

              <div className="hero-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2>{profile.stats.totalPlayTime}</h2>
                  <p>Play Time</p>
                </div>
              </div>
            </div>

            <div className="achievements-section">
              <h3>🏆 Recent Achievements</h3>
              <div className="achievements-grid">
                <div className="achievement-badge">
                  <span className="badge-icon">🎯</span>
                  <div>
                    <h4>Sharpshooter</h4>
                    <p>Scored above 10,000</p>
                  </div>
                </div>
                <div className="achievement-badge">
                  <span className="badge-icon">⚡</span>
                  <div>
                    <h4>Speed Demon</h4>
                    <p>Completed in under 2 minutes</p>
                  </div>
                </div>
                <div className="achievement-badge">
                  <span className="badge-icon">💎</span>
                  <div>
                    <h4>Perfect Run</h4>
                    <p>Zero mistakes</p>
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