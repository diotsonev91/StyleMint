// src/components/AllSamplesPage.tsx
import React, { useState, useEffect } from 'react';
import { Sample } from '../types';

import FilterSidebar from '../components/sounds/FilterSidebar';
import SamplesList from '../components/sounds/SamplesList';
import './AllSamplesPage.css';

// Extended Sample interface with pack info
interface SampleWithPack extends Sample {
  packName: string;
  packId: number;
  artist: string;
  price: number;
}

const AllSamplesPage: React.FC = () => {
  const [allSamples, setAllSamples] = useState<SampleWithPack[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'oneshot' | 'loop'>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data - replace with API call
  useEffect(() => {
    const mockSamples: SampleWithPack[] = [
      {
        id: 1,
        name: "Afro_Percussion_Loop_125bpm",
        duration: "0:08",
        bpm: 125,
        key: "Am",
        genre: "Afro House",
        instrument: "Percussion",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 2.99
      },
      {
        id: 2,
        name: "Deep_Bass_One_Shot",
        duration: "0:03",
        key: "C",
        genre: "Deep House",
        instrument: "Bass",
        sampleType: "oneshot",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 1.99
      },
      {
        id: 3,
        name: "Vocal_Chant_Loop_120bpm",
        duration: "0:16",
        bpm: 120,
        key: "Gm",
        genre: "Afro House",
        instrument: "Vocals",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 3.99
      },
      {
        id: 4,
        name: "Tech_Kick_Punchy",
        duration: "0:01",
        genre: "Tech House",
        instrument: "Drums",
        sampleType: "oneshot",
        audioUrl: "#",
        packName: "Tech House Essentials",
        packId: 2,
        artist: "Defected Records",
        price: 1.49
      },
      {
        id: 5,
        name: "Shaker_Loop_125bpm",
        duration: "0:04",
        bpm: 125,
        genre: "Afro House",
        instrument: "Percussion",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 1.99
      },
      {
        id: 6,
        name: "Synth_Pad_Ambient_Dm",
        duration: "0:32",
        bpm: 120,
        key: "Dm",
        genre: "Deep House",
        instrument: "Synth",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Deep House Collection",
        packId: 3,
        artist: "Anjunadeep",
        price: 4.99
      },
      {
        id: 7,
        name: "Hihat_Roll_Pattern_128",
        duration: "0:02",
        bpm: 128,
        genre: "Tech House",
        instrument: "Drums",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Tech House Essentials",
        packId: 2,
        artist: "Defected Records",
        price: 1.99
      },
      {
        id: 8,
        name: "Marimba_Melody_Loop_F",
        duration: "0:16",
        bpm: 122,
        key: "F",
        genre: "Afro House",
        instrument: "Marimba",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 2.99
      },
      {
        id: 9,
        name: "Bass_Groove_Em",
        duration: "0:08",
        bpm: 124,
        key: "Em",
        genre: "Deep House",
        instrument: "Bass",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Deep House Collection",
        packId: 3,
        artist: "Anjunadeep",
        price: 2.49
      },
      {
        id: 10,
        name: "Clap_One_Shot_Crisp",
        duration: "0:01",
        genre: "Tech House",
        instrument: "Drums",
        sampleType: "oneshot",
        audioUrl: "#",
        packName: "Tech House Essentials",
        packId: 2,
        artist: "Defected Records",
        price: 0.99
      },
      {
        id: 11,
        name: "Vocal_Sample_Soulful",
        duration: "0:12",
        bpm: 120,
        key: "G",
        genre: "Deep House",
        instrument: "Vocals",
        sampleType: "oneshot",
        audioUrl: "#",
        packName: "Deep House Collection",
        packId: 3,
        artist: "Anjunadeep",
        price: 3.99
      },
      {
        id: 12,
        name: "Percussion_Conga_Loop",
        duration: "0:08",
        bpm: 126,
        genre: "Afro House",
        instrument: "Percussion",
        sampleType: "loop",
        audioUrl: "#",
        packName: "Essential Afro House",
        packId: 1,
        artist: "Toolroom Records",
        price: 2.49
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setAllSamples(mockSamples);
      setLoading(false);
    }, 500);
  }, []);

  // Get unique values for filter dropdowns
  const availableGenres = Array.from(new Set(allSamples.map(sample => sample.genre))).sort();
  const availableKeys = Array.from(new Set(allSamples.map(sample => sample.key).filter(Boolean) as string[])).sort();
  const availableInstruments = Array.from(new Set(allSamples.map(sample => sample.instrument).filter(Boolean) as string[])).sort();

  // Filter samples based on all selected filters
  const filteredSamples = allSamples.filter(sample => {
    const genreMatch = selectedGenre === '' || sample.genre === selectedGenre;
    const keyMatch = selectedKey === '' || sample.key === selectedKey;
    const instrumentMatch = selectedInstrument === '' || sample.instrument === selectedInstrument;
    const typeMatch = selectedType === 'all' || sample.sampleType === selectedType;
    
    return genreMatch && keyMatch && instrumentMatch && typeMatch;
  });

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleKeyChange = (key: string) => {
    setSelectedKey(key);
  };

  const handleInstrumentChange = (instrument: string) => {
    setSelectedInstrument(instrument);
  };

  const handleTypeChange = (type: 'all' | 'oneshot' | 'loop') => {
    setSelectedType(type);
  };

  const handleClearAll = () => {
    setSelectedGenre('');
    setSelectedKey('');
    setSelectedInstrument('');
    setSelectedType('all');
  };

  const handleLoadMore = () => {
    console.log('Load more samples');
    // Implement pagination
  };

  if (loading) {
    return (
      <div className="all-samples-page">
  
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-samples-page">
    
      
      <main className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-text">
              <h1 className="page-title">All Samples</h1>
              <p className="page-subtitle">
                Browse our complete collection of high-quality audio samples
              </p>
            </div>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedGenre || selectedKey || selectedInstrument || selectedType !== 'all') && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              <div className="filter-tags">
                {selectedType !== 'all' && (
                  <span className="filter-tag">
                    Type: {selectedType === 'oneshot' ? 'One-Shot' : 'Loop'}
                    <button 
                      className="remove-filter"
                      onClick={() => handleTypeChange('all')}
                      aria-label="Remove type filter"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGenre && (
                  <span className="filter-tag">
                    Genre: {selectedGenre}
                    <button 
                      className="remove-filter"
                      onClick={() => handleGenreChange('')}
                      aria-label="Remove genre filter"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedInstrument && (
                  <span className="filter-tag">
                    Instrument: {selectedInstrument}
                    <button 
                      className="remove-filter"
                      onClick={() => handleInstrumentChange('')}
                      aria-label="Remove instrument filter"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedKey && (
                  <span className="filter-tag">
                    Key: {selectedKey}
                    <button 
                      className="remove-filter"
                      onClick={() => handleKeyChange('')}
                      aria-label="Remove key filter"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Filter Sidebar */}
            <aside className="sidebar">
              <FilterSidebar
                availableGenres={availableGenres}
                availableKeys={availableKeys}
                availableInstruments={availableInstruments}
                selectedGenre={selectedGenre}
                selectedKey={selectedKey}
                selectedInstrument={selectedInstrument}
                selectedType={selectedType}
                onGenreChange={handleGenreChange}
                onKeyChange={handleKeyChange}
                onInstrumentChange={handleInstrumentChange}
                onTypeChange={handleTypeChange}
                onClearAll={handleClearAll}
                totalSamples={allSamples.length}
                filteredCount={filteredSamples.length}
              />
            </aside>

            {/* Samples List */}
            <section className="content-area">
              {filteredSamples.length > 0 ? (
                <SamplesList 
                  samples={filteredSamples} 
                  onLoadMore={handleLoadMore}
                />
              ) : (
                <div className="no-results-message">
                  <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3>No samples found</h3>
                  <p>Try adjusting your filters to see more results</p>
                  <button className="btn btn-primary" onClick={handleClearAll}>
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

export default AllSamplesPage;