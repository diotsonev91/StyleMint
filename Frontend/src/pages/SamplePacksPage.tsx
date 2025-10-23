// src/components/SamplePacksPage.tsx
import React, { useState, useEffect } from 'react';
import { SamplePack } from '../types';
import PacksFilterSidebar from '../components/sounds/PacksFilterSidebar';
import PackCard from '../components/sounds/PackCard';
import './SamplePacksPage.css';
import { useNavigate } from 'react-router-dom';

const SamplePacksPage: React.FC = () => {

    const navigate = useNavigate();
  const [allPacks, setAllPacks] = useState<SamplePack[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - replace with API call
  useEffect(() => {
    const mockPacks: SamplePack[] = [
      {
        id: 1,
        title: "Essential Afro House",
        artist: "Toolroom Records",
        coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
        price: 29.99,
        sampleCount: 245,
        totalSize: "1.2 GB",
        description: "Dive deep into the vibrant world of Afro House.",
        genres: ["Afro House", "Deep House", "Tech House"],
        tags: ["Percussion", "Vocals", "Bass"],
        samples: []
      },
      {
        id: 2,
        title: "Tech House Essentials",
        artist: "Defected Records",
        coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
        price: 34.99,
        sampleCount: 180,
        totalSize: "980 MB",
        description: "Premium tech house sounds for modern producers.",
        genres: ["Tech House", "Minimal Tech"],
        tags: ["Drums", "Bass", "FX"],
        samples: []
      },
      {
        id: 3,
        title: "Deep House Collection",
        artist: "Anjunadeep",
        coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
        price: 39.99,
        sampleCount: 320,
        totalSize: "1.5 GB",
        description: "Atmospheric deep house samples and loops.",
        genres: ["Deep House", "Progressive House"],
        tags: ["Pads", "Bass", "Vocals"],
        samples: []
      },
      {
        id: 4,
        title: "Melodic Techno Pack",
        artist: "Toolroom Records",
        coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        price: 44.99,
        sampleCount: 200,
        totalSize: "1.1 GB",
        description: "Dark and hypnotic melodic techno elements.",
        genres: ["Melodic Techno", "Progressive House"],
        tags: ["Synths", "Arps", "Bass"],
        samples: []
      },
      {
        id: 5,
        title: "Organic House Vibes",
        artist: "Anjunadeep",
        coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
        price: 32.99,
        sampleCount: 150,
        totalSize: "850 MB",
        description: "Natural and organic house music sounds.",
        genres: ["Organic House", "Afro House"],
        tags: ["Percussion", "Woodwinds", "Nature"],
        samples: []
      },
      {
        id: 6,
        title: "Underground Techno",
        artist: "Defected Records",
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        price: 49.99,
        sampleCount: 280,
        totalSize: "1.3 GB",
        description: "Raw underground techno for the dancefloor.",
        genres: ["Tech House", "Minimal Tech"],
        tags: ["Drums", "Kicks", "Industrial"],
        samples: []
      },
      {
        id: 7,
        title: "Progressive House Bundle",
        artist: "Anjunadeep",
        coverImage: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80",
        price: 54.99,
        sampleCount: 400,
        totalSize: "2.1 GB",
        description: "Complete progressive house production toolkit.",
        genres: ["Progressive House", "Deep House"],
        tags: ["Complete", "Leads", "Pads"],
        samples: []
      },
      {
        id: 8,
        title: "Minimal Tech Toolkit",
        artist: "Toolroom Records",
        coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
        price: 27.99,
        sampleCount: 120,
        totalSize: "650 MB",
        description: "Stripped-back minimal techno essentials.",
        genres: ["Minimal Tech", "Tech House"],
        tags: ["Minimal", "Grooves", "Percussion"],
        samples: []
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setAllPacks(mockPacks);
      setLoading(false);
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

  const handleViewDetails = (packId: number) => {
    console.log('View pack details:', packId);
    // Navigate to SamplesPage with pack ID
     navigate(`/pack/${packId}`)
  };

  const handleAddToCart = (packId: number) => {
    console.log('Add pack to cart:', packId);
    alert('Added to cart! (This would integrate with your Spring Boot backend)');
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