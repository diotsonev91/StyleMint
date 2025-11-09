// src/components/SamplePacksPage.tsx - Refactored to use real backend API
import React, { useState, useEffect } from 'react';
import PacksFilterSidebar from '../../components/sounds/PacksFilterSidebar';
import PacksGrid from '../../components/sounds/PacksGrid';
import { SamplePack } from '../../types';
import './SamplePacksPage.css';
import { audioPackService } from '../../services/audioPackService';
import { useAuth } from '../../hooks/useAuth';
const SamplePacksPage: React.FC = () => {
  const [allPacks, setAllPacks] = useState<SamplePack[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();

     const currentUserId = user?.id;
  // ✅ Load from real backend API
  useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use getAllPacks with pagination - you might want to adjust page/size based on your needs
        const response = await audioPackService.getAllPacks(0, 50); // Get first 50 packs
        
        if (response.success && response.data) {
          // Handle both array and Page response format
          const packsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.content || [];
          console.log(response.data)
          // Transform backend DTO to frontend SamplePack type if needed
          const transformedPacks = packsData.map((pack: any) => ({
            id: pack.id,
            title: pack.title,
            artist: pack.artist,
            price: pack.price,
            description: pack.description,
            coverImage: pack.coverImageUrl || pack.coverImage,
            genres: pack.genres || [],
            tags: pack.tags || [],
            samples: pack.samples || [], // This might be empty in basic pack DTO
            rating: pack.rating,
            downloadCount: pack.downloadCount,
            createdAt: pack.createdAt,
            updatedAt: pack.updatedAt, 
            isLoggedUserPack: currentUserId == pack.authorId
          }));
          console.log(currentUserId, "   ---", )
          
          
          setAllPacks(transformedPacks);
          console.log(`✅ Loaded ${transformedPacks.length} sample packs from API`);
        } else {
          setError(response.error || 'Failed to load sample packs');
        }
      } catch (err: any) {
        console.error('Error loading sample packs:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  // Alternative: Load featured packs instead of all packs
  const loadFeaturedPacks = async () => {
    try {
      setLoading(true);
      const response = await audioPackService.getFeaturedPacks(0, 50);
      
      if (response.success && response.data) {
        const packsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        
        const transformedPacks = packsData.map((pack: any) => ({
          id: pack.id,
          title: pack.title,
          artist: pack.artist,
          price: pack.price,
          description: pack.description,
          coverImage: pack.coverImageUrl || pack.coverImage,
          genres: pack.genres || [],
          tags: pack.tags || [],
          samples: pack.samples || [],
          rating: pack.rating,
          downloadCount: pack.downloadCount,
          createdAt: pack.createdAt,
          updatedAt: pack.updatedAt
        }));
        
        setAllPacks(transformedPacks);
      }
    } catch (err: any) {
      console.error('Error loading featured packs:', err);
      setError(err.message || 'Failed to load featured packs');
    } finally {
      setLoading(false);
    }
  };

  // Search packs by title when search query changes
  useEffect(() => {
    const searchPacks = async () => {
      if (searchQuery.trim()) {
        try {
          setLoading(true);
          // You might want to implement a debounced search here
          const response = await audioPackService.searchPacks({
            title: searchQuery,
            // Add other search criteria as needed
          });
          
          if (response.success && response.data) {
            const searchResults = Array.isArray(response.data) 
              ? response.data 
              : response.data.content || [];
            
            const transformedPacks = searchResults.map((pack: any) => ({
              id: pack.id,
              title: pack.title,
              artist: pack.artist,
              price: pack.price,
              description: pack.description,
              coverImage: pack.coverImageUrl || pack.coverImage,
              genres: pack.genres || [],
              tags: pack.tags || [],
              samples: pack.samples || [],
              rating: pack.rating,
              downloadCount: pack.downloadCount,
              createdAt: pack.createdAt,
              updatedAt: pack.updatedAt
            }));
            
            setAllPacks(transformedPacks);
          }
        } catch (err: any) {
          console.error('Error searching packs:', err);
          setError(err.message || 'Search failed');
        } finally {
          setLoading(false);
        }
      }
    };

    // Simple debounce - you might want to implement a proper debounce
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPacks();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get unique authors and genres from loaded packs
  const availableAuthors = Array.from(new Set(allPacks.map(pack => pack.artist))).sort();
  const availableGenres = Array.from(
    new Set(allPacks.flatMap(pack => pack.genres))
  ).sort();

  // Filter packs client-side for author and genre filters
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

  const handleAuthorChange = (author: string) => {
    setSelectedAuthor(author);
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    }
  };

  const handleClearFilters = () => {
    setSelectedAuthor('');
    setSelectedGenres([]);
    setSearchQuery('');
  };

  const handleRetry = () => {
    // Reload the packs
    window.location.reload(); // Or implement a proper retry function
  };

  if (loading) {
    return (
      <div className="sample-packs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sample packs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sample-packs-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load sample packs</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
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
              <h1 className="packs-page-title">Sample Packs</h1>
              <p className="packs-page-subtitle">
                Discover premium sound packs from top artists and labels
              </p>
              <div className="packs-stats">
                <span className="packs-count">{filteredPacks.length} packs available</span>
              </div>
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

          {/* Search Bar */}
          <div className="packs-search-container">
            <svg className="packs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search packs by name or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="packs-search-input"
            />
            {searchQuery && (
              <button 
                className="packs-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Active Filters */}
          {(selectedAuthor || selectedGenres.length > 0 || searchQuery) && (
            <div className="packs-active-filters">
              <span className="packs-active-filters-label">Active filters:</span>
              <div className="packs-filter-tags">
                {selectedAuthor && (
                  <span className="packs-filter-tag">
                    Author: {selectedAuthor}
                    <button 
                      className="packs-remove-filter"
                      onClick={() => setSelectedAuthor('')}
                      aria-label="Remove author filter"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGenres.map(genre => (
                  <span key={genre} className="packs-filter-tag">
                    {genre}
                    <button 
                      className="packs-remove-filter"
                      onClick={() => handleGenreChange(genre, false)}
                      aria-label={`Remove ${genre} filter`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {searchQuery && (
                  <span className="packs-filter-tag">
                    Search: "{searchQuery}"
                    <button 
                      className="packs-remove-filter"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              <button 
                className="packs-clear-all-filters"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="packs-content-grid">
            {/* Filter Sidebar */}
            <aside className="packs-sidebar">
              <PacksFilterSidebar
                availableAuthors={availableAuthors}
                availableGenres={availableGenres}
                selectedAuthor={selectedAuthor}
                selectedGenres={selectedGenres}
                onAuthorChange={handleAuthorChange}
                onGenreChange={handleGenreChange}
                onClearFilters={handleClearFilters}
                totalPacks={allPacks.length}
                filteredCount={filteredPacks.length}
              />
            </aside>

            {/* Packs Grid - Now using reusable component */}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default SamplePacksPage;