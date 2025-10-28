// src/components/SamplePacksPage.tsx - Using mockPacks data
import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { cartState } from '../../state/CartItemState';
import { SamplePack } from '../../types';
import PacksFilterSidebar from '../../components/sounds/PacksFilterSidebar';
import PackCard from '../../components/sounds/PackCard';
import './SamplePacksPage.css';
import { useNavigate } from 'react-router-dom';
import { addSamplePackToCart } from '../../services/CartService';
import mockPacks from '../../mock/mockPacks'; // ✅ Import mock data

const SamplePacksPage: React.FC = () => {
  const navigate = useNavigate();
  const cartSnap = useSnapshot(cartState);
  
  const [allPacks, setAllPacks] = useState<SamplePack[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ✅ Load from mockPacks instead of inline data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAllPacks(mockPacks);
      setLoading(false);
      console.log(`✅ Loaded ${mockPacks.length} sample packs with samples:`, 
        mockPacks.map(p => `${p.title}: ${p.samples.length} samples`)
      );
    }, 500);
  }, []);

  // Get unique authors and genres
  const availableAuthors = Array.from(new Set(allPacks.map(pack => pack.artist))).sort();
  const availableGenres = Array.from(
    new Set(allPacks.flatMap(pack => pack.genres))
  ).sort();

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
  };

  const handleViewDetails = (packId: string) => {
    navigate(`/pack/${packId}`);
  };

  const handleAddToCart = (pack: SamplePack) => {
    // Check if pack is already in cart
    const alreadyInCart = cartSnap.items.some(
      item => item.id === pack.id && item.type === 'pack'
    );

    if (alreadyInCart) {
      console.log(`⚠️ Pack "${pack.title}" is already in cart`);
      // Optional: Show toast notification
      return;
    }

    // ✅ Add pack + all samples
    console.log(`📦 Adding pack "${pack.title}" with ${pack.samples.length} samples...`);
    addSamplePackToCart(pack);
    
    // Optional: Show success notification
    console.log(`✅ Added "${pack.title}" to cart`);
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
          {(selectedAuthor || selectedGenres.length > 0) && (
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
              </div>
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

            {/* Packs Grid */}
            <section className="packs-content-area">
              {filteredPacks.length > 0 ? (
                <div className={`packs-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {filteredPacks.map((pack) => (
                    <PackCard
                      key={pack.id}
                      pack={pack}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="packs-no-results">
                  <svg className="packs-no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3>No packs found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Clear All Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SamplePacksPage;