// src/pages/UserSamplesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../../services/audioService';
import { checkAuth } from '../../api/auth';
import SamplesList from '../../components/sounds/SamplesList';
import { SamplesFromPackDTO } from '../../types';
import './UserSamplesPage.css';

const UserSamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [samples, setSamples] = useState<SamplesFromPackDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          sessionStorage.setItem('redirectAfterLogin', '/my-samples');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          // Load user samples after authentication check
          loadUserSamples();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const loadUserSamples = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await audioService.getMyUploadedSamples();
      
      if (response.success) {
        // Transform the response data to match SamplesFromPackDTO format
        const userSamples: SamplesFromPackDTO[] = Array.isArray(response.data) 
          ? response.data.map((sample: any) => ({
              id: sample.id,
              name: sample.name,
              artist: sample.artist,
              audioUrl: sample.audioUrl,
              duration: sample.duration,
              bpm: sample.bpm,
              key: sample.key,
              scale: sample.scale,
              genre: sample.genre,
              instrumentGroup: sample.instrumentGroup,
              sampleType: sample.sampleType,
              price: sample.price,
              packId: sample.packId,
              packTitle: sample.packTitle,
              createdAt: sample.createdAt,
              updatedAt: sample.updatedAt
            }))
          : [];

        if (page === 0) {
          setSamples(userSamples);
        } else {
          setSamples(prev => [...prev, ...userSamples]);
        }

        // Simple pagination - you might want to implement proper pagination based on your API
        setHasMore(userSamples.length > 0 && userSamples.length >= 20); // Assuming 20 per page
        setCurrentPage(page);
      } else {
        setError(response.error || 'Failed to load your samples');
      }
    } catch (err: any) {
      console.error('Error loading user samples:', err);
      setError('An unexpected error occurred while loading your samples');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadUserSamples(currentPage + 1);
  };

  const handleUploadNew = () => {
    navigate('/upload');
  };

  const handleEditSample = (sampleId: string) => {
    // Navigate to edit sample page or open edit modal
    console.log('Edit sample:', sampleId);
    // navigate(`/edit-sample/${sampleId}`);
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (window.confirm('Are you sure you want to delete this sample? This action cannot be undone.')) {
      try {
        // You'll need to implement delete functionality in your audioService
        // const response = await audioService.deleteSample(sampleId);
        // if (response.success) {
        //   setSamples(prev => prev.filter(sample => sample.id !== sampleId));
        // } else {
        //   setError(response.error || 'Failed to delete sample');
        // }
        console.log('Delete sample:', sampleId);
        // For now, just remove from local state
        setSamples(prev => prev.filter(sample => sample.id !== sampleId));
      } catch (err) {
        console.error('Error deleting sample:', err);
        setError('Failed to delete sample');
      }
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="user-samples-page">
        <div className="page-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="page-container">
          <div className="auth-check-container">
            <div className="spinner-large"></div>
            <p>Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if not authenticated (briefly before redirect)
  if (!isAuthenticated) {
    return (
      <div className="user-samples-page">
        <div className="page-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="page-container">
          <div className="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Authentication Required</strong>
              <p>You must be logged in to view your samples. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-samples-page">
      {/* Background */}
      <div className="page-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div className="header-text">
              <h1 className="page-title">
                My <span className="gradient-text">Samples</span>
              </h1>
              <p className="page-subtitle">
                Manage and listen to your uploaded audio samples
              </p>
            </div>
            <button 
              className="btn-primary upload-btn"
              onClick={handleUploadNew}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Sample
            </button>
          </div>

          {/* Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{samples.length}</div>
              <div className="stat-label">Total Samples</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {samples.filter(s => s.sampleType === 'loop').length}
              </div>
              <div className="stat-label">Loops</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {samples.filter(s => s.sampleType === 'oneshot').length}
              </div>
              <div className="stat-label">One Shots</div>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              className="alert-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && samples.length === 0 && (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading your samples...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && samples.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3>No Samples Yet</h3>
            <p>You haven't uploaded any audio samples yet. Start sharing your sounds with the community!</p>
            <button 
              className="btn-primary"
              onClick={handleUploadNew}
            >
              Upload Your First Sample
            </button>
          </div>
        )}

        {/* Samples List */}
        {samples.length > 0 && (
          <div className="samples-section">
            <SamplesList
              samples={samples}
              onLoadMore={hasMore ? handleLoadMore : undefined}
            />
          </div>
        )}

        {/* Loading More State */}
        {isLoading && samples.length > 0 && (
          <div className="loading-more">
            <div className="spinner"></div>
            <span>Loading more samples...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSamplesPage;