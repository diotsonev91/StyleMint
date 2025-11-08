// src/components/ProducerSection.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../api/auth';
import { audioSampleService } from '../../services/audioSampleService';
import { audioPackService } from '../../services/audioPackService';
import { LoginRequiredModal } from '../../components/LoginRequiredModal';
import './ProducerSection.css';

export const ProducerSection: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  const [hasSamples, setHasSamples] = useState(false);
  const [hasPacks, setHasPacks] = useState(false);
  const [samplesCount, setSamplesCount] = useState(0);
  const [packsCount, setPacksCount] = useState(0);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setIsCheckingAuth(true);
    try {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Check if user has uploaded content
        await checkUserContent();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const checkUserContent = async () => {
    setIsLoadingContent(true);
    try {
      // Check for samples
      const samplesResult = await audioSampleService.hasUploadedSamples();
      if (!samplesResult.error) {
        setHasSamples(samplesResult.hasSamples);
        setSamplesCount(samplesResult.totalCount || 0);
      }

      // Check for packs
      const packsResult = await audioPackService.hasUploadedPacks();
      if (!packsResult.error) {
        setHasPacks(packsResult.hasPacks);
        setPacksCount(packsResult.count || 0);
      }
    } catch (error) {
      console.error('Error checking user content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleUploadSample = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate('/upload-sample');
  };

  const handleUploadPack = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate('/upload-pack');
  };

  const handleViewMySamples = () => {
    navigate('/my-samples');
  };

  const handleViewMyPacks = () => {
    navigate('/my-packs');
  };

  if (isCheckingAuth) {
    return (
      <div className="producer-section">
        <div className="producer-section-loading">
          <div className="loading-spinner-small"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="producer-section">
        <div className="producer-section-container">
          <div className="producer-section-header">
            <div className="producer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="producer-section-title">
              Become a <span className="gradient-text">Producer</span>
            </h2>
            <p className="producer-section-subtitle">
              Share your sounds with the world and earn from your creations
            </p>
          </div>

          <div className="producer-actions">
            {/* Sample Button/Link */}
            <div className="producer-action-card">
              <div className="action-card-icon sample-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3>Individual Samples</h3>
              <p>Upload and sell individual audio samples</p>
              
              <div className="producer-action-buttons">
                {/* Always show Upload Sample button for authenticated users */}
                {isAuthenticated && (
                  <button
                    className="producer-btn producer-btn-upload"
                    onClick={handleUploadSample}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Sample
                  </button>
                )}

                {/* Show View My Samples button if user has samples */}
                {isAuthenticated && hasSamples && (
                  <button
                    className="producer-btn producer-btn-view"
                    onClick={handleViewMySamples}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    My Samples ({samplesCount})
                  </button>
                )}

                {/* Show only Upload button for unauthenticated users */}
                {!isAuthenticated && (
                  <button
                    className="producer-btn producer-btn-upload"
                    onClick={handleUploadSample}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Sample
                  </button>
                )}
              </div>
            </div>

            {/* Pack Button/Link */}
            <div className="producer-action-card">
              <div className="action-card-icon pack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3>Sample Packs</h3>
              <p>Upload and sell complete sample packs</p>
              
              <div className="producer-action-buttons">
                {/* Always show Upload Pack button for authenticated users */}
                {isAuthenticated && (
                  <button
                    className="producer-btn producer-btn-upload"
                    onClick={handleUploadPack}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Pack
                  </button>
                )}

                {/* Show View My Packs button if user has packs */}
                {isAuthenticated && hasPacks && (
                  <button
                    className="producer-btn producer-btn-view"
                    onClick={handleViewMyPacks}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    My Packs ({packsCount})
                  </button>
                )}

                {/* Show only Upload button for unauthenticated users */}
                {!isAuthenticated && (
                  <button
                    className="producer-btn producer-btn-upload"
                    onClick={handleUploadPack}
                    disabled={isLoadingContent}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Pack
                  </button>
                )}
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="producer-auth-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Sign in to start uploading and selling your sounds</span>
            </div>
          )}
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};