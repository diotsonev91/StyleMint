// PacksFilterSidebar.tsx - Updated with price range slider

import React from 'react';
import './PacksFilterSidebar.css';

interface PacksFilterSidebarProps {
    availableAuthors: string[];
    availableGenres: string[];
    selectedAuthor: string;
    selectedGenres: string[];
    priceRange: [number, number];
    onAuthorChange: (author: string) => void;
    onGenreChange: (genre: string, checked: boolean) => void;
    onPriceRangeChange: (min: number, max: number) => void;
    onClearFilters: () => void;
    totalPacks: number;
    filteredCount: number;
    minPrice: number;
    maxPrice: number;
}

const PacksFilterSidebar: React.FC<PacksFilterSidebarProps> = ({
                                                                   availableAuthors,
                                                                   availableGenres,
                                                                   selectedAuthor,
                                                                   selectedGenres,
                                                                   priceRange,
                                                                   onAuthorChange,
                                                                   onGenreChange,
                                                                   onPriceRangeChange,
                                                                   onClearFilters,
                                                                   totalPacks,
                                                                   filteredCount,
                                                                   minPrice,
                                                                   maxPrice
                                                               }) => {
    return (
        <div className="packs-filter-sidebar">
            <div className="filter-header">
                <h3>Filters</h3>
                {(selectedAuthor || selectedGenres.length > 0) && (
                    <button onClick={onClearFilters} className="clear-all-btn">
                        Clear All
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div className="filter-results-count">
                Showing {filteredCount} of {totalPacks} packs
            </div>

            {/* Author/Artist Filter */}
            <div className="filter-section">
                <h4 className="filter-section-title">AUTHOR / ARTIST</h4>
                <div className="filter-search-wrapper">
                    <input
                        type="text"
                        placeholder="Search by author..."
                        value={selectedAuthor}
                        onChange={(e) => onAuthorChange(e.target.value)}
                        className="filter-search-input"
                    />
                </div>

                {/* Show available artists as suggestions */}
                {selectedAuthor && (
                    <div className="author-suggestions">
                        {availableAuthors
                            .filter(author =>
                                author.toLowerCase().includes(selectedAuthor.toLowerCase())
                            )
                            .slice(0, 5)
                            .map(author => (
                                <button
                                    key={author}
                                    onClick={() => onAuthorChange(author)}
                                    className="author-suggestion"
                                >
                                    {author}
                                </button>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* Genres Filter */}
            <div className="filter-section">
                <h4 className="filter-section-title">GENRES</h4>
                <div className="filter-checkboxes">
                    {availableGenres.map(genre => (
                        <label key={genre} className="filter-checkbox-label">
                            <input
                                type="checkbox"
                                checked={selectedGenres.includes(genre)}
                                onChange={(e) => onGenreChange(genre, e.target.checked)}
                                className="filter-checkbox"
                            />
                            <span className="checkbox-text">{genre}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
                <h4 className="filter-section-title">PRICE RANGE</h4>
                <div className="price-range-wrapper">
                    <div className="price-range-inputs">
                        <input
                            type="number"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={(e) => onPriceRangeChange(+e.target.value, priceRange[1])}
                            className="price-input"
                        />
                        <span className="price-separator">-</span>
                        <input
                            type="number"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => onPriceRangeChange(priceRange[0], +e.target.value)}
                            className="price-input"
                        />
                    </div>

                    {/* Dual range slider */}
                    <div className="price-slider-wrapper">
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={(e) => onPriceRangeChange(+e.target.value, priceRange[1])}
                            className="price-slider price-slider-min"
                        />
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => onPriceRangeChange(priceRange[0], +e.target.value)}
                            className="price-slider price-slider-max"
                        />
                        <div className="slider-track"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PacksFilterSidebar;