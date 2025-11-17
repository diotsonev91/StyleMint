// src/components/FilterSidebar.tsx
import React, { useState } from 'react';
import './FilterSidebar.css';

interface FilterSidebarProps {
  availableGenres: string[];
  availableKeys: string[];
  availableInstruments: string[];
  selectedGenre: string;
  selectedKey: string;
  selectedInstrument: string;
  selectedType: 'all' | 'ONESHOT' | 'LOOP';
  onGenreChange: (genre: string) => void;
  onKeyChange: (key: string) => void;
  onInstrumentChange: (instrument: string) => void;
  onTypeChange: (type: 'all' | 'ONESHOT' | 'LOOP') => void;
  onClearAll: () => void;
  totalSamples: number;
  filteredCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  availableGenres,
  availableKeys,
  availableInstruments,
  selectedGenre,
  selectedKey,
  selectedInstrument,
  selectedType,
  onGenreChange,
  onKeyChange,
  onInstrumentChange,
  onTypeChange,
  onClearAll,
  totalSamples,
  filteredCount
}) => {
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 180]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const hasActiveFilters = selectedGenre !== '' || 
                          selectedKey !== '' || 
                          selectedInstrument !== '' || 
                          selectedType !== 'all';

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>
        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="results-count">
        <p>
          Showing <strong>{filteredCount}</strong> of <strong>{totalSamples}</strong> samples
        </p>
      </div>

      {/* Sample Type Filter (One-Shot / Loop) */}
      <div className="filter-section">
        <h3 className="filter-section-title">Sample Type</h3>
        <div className="radio-group">
          <label className="radio-item">
            <input
              type="radio"
              name="sampleType"
              value="all"
              checked={selectedType === 'all'}
              onChange={() => onTypeChange('all')}
              className="radio-input"
            />
            <span className="radio-checkmark">
              {selectedType === 'all' && (
                <span className="radio-dot"></span>
              )}
            </span>
            <span className="radio-label">All Types</span>
          </label>
          
          <label className="radio-item">
            <input
              type="radio"
              name="sampleType"
              value="oneshot"
              checked={selectedType === 'ONESHOT'}
              onChange={() => onTypeChange('ONESHOT')}
              className="radio-input"
            />
            <span className="radio-checkmark">
              {selectedType === 'ONESHOT' && (
                <span className="radio-dot"></span>
              )}
            </span>
            <span className="radio-label">One-Shots</span>
          </label>
          
          <label className="radio-item">
            <input
              type="radio"
              name="sampleType"
              value="loop"
              checked={selectedType === 'LOOP'}
              onChange={() => onTypeChange('LOOP')}
              className="radio-input"
            />
            <span className="radio-checkmark">
              {selectedType === 'LOOP' && (
                <span className="radio-dot"></span>
              )}
            </span>
            <span className="radio-label">Loops</span>
          </label>
        </div>
      </div>

      {/* Genre Dropdown */}
      <div className="filter-section">
        <h3 className="filter-section-title">Genre</h3>
        <select 
          className="filter-select"
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
        >
          <option value="">All Genres</option>
          {availableGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Instrument Dropdown */}
      <div className="filter-section">
        <h3 className="filter-section-title">Instrument</h3>
        <select 
          className="filter-select"
          value={selectedInstrument}
          onChange={(e) => onInstrumentChange(e.target.value)}
        >
          <option value="">All Instruments</option>
          {availableInstruments.map((instrument) => (
            <option key={instrument} value={instrument}>
              {instrument}
            </option>
          ))}
        </select>
      </div>

      {/* Musical Key Dropdown */}
      <div className="filter-section">
        <h3 className="filter-section-title">Musical Key</h3>
        <select 
          className="filter-select"
          value={selectedKey}
          onChange={(e) => onKeyChange(e.target.value)}
        >
          <option value="">All Keys</option>
          {availableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {/* BPM Range */}
      <div className="filter-section">
        <h3 className="filter-section-title">
          BPM Range: {bpmRange[0]} - {bpmRange[1]}
        </h3>
        <div className="range-inputs">
          <input
            type="number"
            value={bpmRange[0]}
            onChange={(e) => setBpmRange([parseInt(e.target.value) || 0, bpmRange[1]])}
            className="range-input"
            placeholder="Min"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            value={bpmRange[1]}
            onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value) || 180])}
            className="range-input"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3 className="filter-section-title">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </h3>
        <div className="range-inputs">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            className="range-input"
            placeholder="Min"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
            className="range-input"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="filter-section">
        <h3 className="filter-section-title">Sort By</h3>
        <select className="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;