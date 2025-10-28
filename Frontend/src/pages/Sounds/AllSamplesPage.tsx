// src/components/AllSamplesPage.tsx - Load all samples from mockPacks
import React, { useState, useEffect } from 'react';
import { SamplesFromPackDTO } from '../../types';
import mockPacks from '../../mock/mockPacks';
import FilterSidebar from '../../components/sounds/FilterSidebar';
import SamplesList from '../../components/sounds/SamplesList';
import './AllSamplesPage.css';

const AllSamplesPage: React.FC = () => {
  const [allSamples, setAllSamples] = useState<SamplesFromPackDTO[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'oneshot' | 'loop'>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // ✅ Load all samples from all packs in mockPacks
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Flatten all samples from all packs
      const samples = mockPacks.flatMap(pack => pack.samples);
      setAllSamples(samples);
      setLoading(false);
      console.log(`✅ Loaded ${samples.length} samples from ${mockPacks.length} packs`);
    }, 500);
  }, []);

  // Get unique values for filter dropdowns
  const availableGenres = [...new Set(allSamples
    .map(s => s.genre)
    .filter((g): g is string => Boolean(g))
  )].sort();

  const availableKeys = Array.from(
    new Set(allSamples.map(sample => sample.key).filter(Boolean) as string[])
  ).sort();

  const availableInstruments = Array.from(
    new Set(allSamples.map(sample => sample.instrument).filter(Boolean) as string[])
  ).sort();

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
    // Implement pagination if needed
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
                Browse our complete collection of {allSamples.length} high-quality audio samples
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