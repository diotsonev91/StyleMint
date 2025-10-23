// src/components/PacksFilterSidebar.tsx
import React from 'react';
import './PacksFilterSidebar.css';

interface PacksFilterSidebarProps {
  availableAuthors: string[];
  availableGenres: string[];
  selectedAuthor: string;
  selectedGenres: string[];
  onAuthorChange: (author: string) => void;
  onGenreChange: (genre: string, checked: boolean) => void;
  onClearFilters: () => void;
  totalPacks: number;
  filteredCount: number;
}

const PacksFilterSidebar: React.FC<PacksFilterSidebarProps> = ({
  availableAuthors,
  availableGenres,
  selectedAuthor,
  selectedGenres,
  onAuthorChange,
  onGenreChange,
  onClearFilters,
  totalPacks,
  filteredCount
}) => {
  return (
    <div className="packs-filter-sidebar">
      <div className="packs-filter-header">
        <h2 className="packs-filter-title">Filters</h2>
        {(selectedAuthor || selectedGenres.length > 0) && (
          <button className="packs-clear-btn" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="packs-results-count">
        <p>
          Showing <strong>{filteredCount}</strong> of <strong>{totalPacks}</strong> packs
        </p>
      </div>

      {/* Author Filter */}
      <div className="packs-filter-section">
        <h3 className="packs-filter-section-title">Author / Artist</h3>
        <div className="author-search-wrapper">
          <svg className="author-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by author..."
            value={selectedAuthor}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="author-search-input"
          />
          {selectedAuthor && (
            <button 
              className="clear-author"
              onClick={() => onAuthorChange('')}
              aria-label="Clear author"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Author Suggestions */}
        {!selectedAuthor && availableAuthors.length > 0 && (
          <div className="author-suggestions">
            {availableAuthors.slice(0, 5).map((author) => (
              <button
                key={author}
                className="author-suggestion-btn"
                onClick={() => onAuthorChange(author)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {author}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Genre Filter */}
      <div className="packs-filter-section">
        <h3 className="packs-filter-section-title">Genres</h3>
        <div className="packs-checkbox-list">
          {availableGenres.map((genre) => {
            const isChecked = selectedGenres.includes(genre);
            return (
              <label key={genre} className="packs-checkbox-item">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onGenreChange(genre, e.target.checked)}
                  className="packs-checkbox-input"
                />
                <span className="packs-checkbox-label">{genre}</span>
                <span className="packs-checkbox-checkmark">
                  {isChecked && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div className="packs-filter-section">
        <h3 className="packs-filter-section-title">Sort By</h3>
        <select className="packs-sort-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="samples">Most Samples</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="packs-filter-section">
        <h3 className="packs-filter-section-title">Price Range</h3>
        <div className="packs-range-inputs">
          <input
            type="number"
            placeholder="Min"
            className="packs-range-input"
            min="0"
          />
          <span className="packs-range-separator">-</span>
          <input
            type="number"
            placeholder="Max"
            className="packs-range-input"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default PacksFilterSidebar;