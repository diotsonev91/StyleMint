// src/pages/UserPacksPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PacksGrid from '../../components/sounds/PacksGrid';
import { SamplePack } from '../../types';
import { audioPackService } from '../../services/audioPackService';
import './SamplePacksPage.css'; // Reuse existing CSS

const UserPacksPage: React.FC = () => {
  const navigate = useNavigate();
  const [allPacks, setAllPacks] = useState<SamplePack[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAuth, setIsAuth]= useState(true);
  // Fetch user's uploaded packs
// Fetch user's uploaded packs
useEffect(() => {
  const fetchUserPacks = async () => {
    setLoading(true);
    setError(null);

    const response = await audioPackService.getMyUploadedPacks();

    if (response.success) {
      const packs = Array.isArray(response.data) ? response.data : response.data?.packs || [];
      
      // Set isLoggedUserPack to true for all packs while preserving all other properties
      const packsWithUserFlag = packs.map(pack => {
        return {
          ...pack,
          isLoggedUserPack: true
        } as SamplePack;
      });
      
      setAllPacks(packsWithUserFlag);
      console.log(`✅ Loaded ${packsWithUserFlag.length} user packs`);
    } else {
        let errorMessage = 'Failed to load your packs';
      
      if (response.error?.includes('403')) {
        errorMessage = 'Please log in to view your packs';
        setIsAuth(false);
      } else if (response.error) {
        errorMessage = response.error;
      }
      
      setError(errorMessage);
      console.error('❌ Error loading user packs:', response.error);
    }

    setLoading(false);
  };

  fetchUserPacks();
}, []);


  // Filter packs
  const filteredPacks = allPacks.filter(pack => {
    const authorMatch = !selectedAuthor || 
                       pack.artist.toLowerCase().includes(selectedAuthor.toLowerCase());
    
    const genreMatch = selectedGenres.length === 0 || 
                      pack.genres.some(genre => selectedGenres.includes(genre));
    
    const searchMatch = !searchQuery ||
                       pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       pack.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    return authorMatch && genreMatch && searchMatch;
  });



  const handleClearFilters = () => {
    setSelectedAuthor('');
    setSelectedGenres([]);
  };

  const handleUploadNew = () => {
    navigate('/upload-pack');
  };

  if (loading) {
    return (
      <div className="sample-packs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your packs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sample-packs-page">
        <main className="main-content">
          <div className="container">
            <div className="packs-no-results">
              <svg className="packs-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isAuth && 
              <>
              <h3>Error Loading Packs</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Try Again
              </button>
              </>
              }
              <h3>{error}</h3>
              
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="sample-packs-page">   
      <main className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="packs-page-header">

            <div className="packs-header-text">
                <button
                    className="btn btn-primary"
                    onClick={handleUploadNew}
                    style={{ marginBottom: '2rem', whiteSpace: 'nowrap' }}
                >
                    Upload New Pack
                </button>
              <h1 className="packs-page-title">My Sample Packs</h1>
              <p className="packs-page-subtitle">
                {allPacks.length === 0 
                  ? 'You haven\'t uploaded any packs yet' 
                  : `Manage your ${allPacks.length} uploaded pack${allPacks.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>


            <div className="packs-view-controls">

              <button 
                className={`packs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
              <button 
                className={`packs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Only show search and filters if user has packs */}
          {allPacks.length > 0 && (
            <>
          

    
                {/* Packs Grid */}
                <section className="packs-content-area">
                  <PacksGrid
                    packs={filteredPacks}
                    viewMode={viewMode}
                    emptyStateMessage={{
                      title: 'No packs found',
                      description: 'Try adjusting your search or filters',
                      showClearFilters: true
                    }}
                    onClearFilters={handleClearFilters}
                  />
                </section>
             
            </>
          )}

          {/* Empty State - No packs uploaded yet */}
          {allPacks.length === 0 && (
            <div className="packs-no-results">
              <svg className="packs-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3>No Packs Yet</h3>
              <p>Start building your collection by uploading your first sample pack</p>
              <button className="btn btn-primary" onClick={handleUploadNew}>
                Upload Your First Pack
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPacksPage;
