// SamplePacksPage.tsx - Updated with backend filters

import React, { useState, useEffect } from 'react';
import PacksFilterSidebar from '../../components/sounds/PacksFilterSidebar';
import PacksGrid from '../../components/sounds/PacksGrid';
import { SamplePack } from '../../types';
import { SamplePackFilterRequest, PackFilterMetadata } from '../../types/audioFilter';
import './SamplePacksPage.css';
import { packApi} from '../../api/pack.api';
import { getCurrentUser } from "../../api/auth";
import {packFilterApi} from "../../api/packFilter.api";

const SamplePacksPage: React.FC = () => {
    const [packs, setPacks] = useState<SamplePack[]>([]);
    const [metadata, setMetadata] = useState<PackFilterMetadata | null>(null);

    // Filter state
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
    const [sortBy, setSortBy] = useState<string>('newest');

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Load filter metadata on mount
    useEffect(() => {
        loadFilterMetadata();
    }, []);

    // Load packs when filters change
    useEffect(() => {
        loadPacks();
    }, [selectedAuthor, selectedGenres, searchQuery, priceRange, sortBy, currentPage]);

    const loadFilterMetadata = async () => {
        try {
            const meta = await packFilterApi.getFilterMetadata();
            setMetadata(meta);
            setPriceRange([meta.minPrice, meta.maxPrice]);
        } catch (err: any) {
            console.error('Error loading filter metadata:', err);
        }
    };

    const loadPacks = async () => {
        try {
            setLoading(true);
            setError(null);

            const filterRequest: SamplePackFilterRequest = {
                artist: selectedAuthor || undefined,
                title: searchQuery || undefined,
                genres: selectedGenres.length > 0 ? selectedGenres : undefined,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                sortBy: sortBy as any
            };

            const response = await packFilterApi.filterPacks(filterRequest, currentPage, 20);

            if (response && response.content) {
                const currentUser = await getCurrentUser();

                const transformedPacks = response.content.map((pack: any) => ({
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
                    downloadCount: pack.downloadCount || pack.downloads,
                    createdAt: pack.createdAt,
                    updatedAt: pack.updatedAt,
                    authorId: pack.authorId,
                    isLoggedUserPack: pack.authorId === currentUser?.id,
                }));

                setPacks(transformedPacks);
                setTotalPages(response.totalPages);
                console.log(`✅ Loaded ${transformedPacks.length} filtered packs`);
            }
        } catch (err: any) {
            console.error('Error loading packs:', err);
            setError(err.message || 'Failed to load sample packs');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorChange = (author: string) => {
        setSelectedAuthor(author);
        setCurrentPage(0); // Reset to first page
    };

    const handleGenreChange = (genre: string, checked: boolean) => {
        if (checked) {
            setSelectedGenres([...selectedGenres, genre]);
        } else {
            setSelectedGenres(selectedGenres.filter(g => g !== genre));
        }
        setCurrentPage(0);
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        setPriceRange([min, max]);
        setCurrentPage(0);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(0);
    };

    const handleClearFilters = () => {
        setSelectedAuthor('');
        setSelectedGenres([]);
        setSearchQuery('');
        if (metadata) {
            setPriceRange([metadata.minPrice, metadata.maxPrice]);
        }
        setSortBy('newest');
        setCurrentPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && currentPage === 0) {
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
                    <button onClick={loadPacks} className="retry-button">
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
                <span className="packs-count">
                  {packs.length} of {metadata?.totalPacks || 0} packs
                </span>
                            </div>
                        </div>

                        <div className="packs-view-controls">
                            <button
                                className={`packs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                            </button>
                            <button
                                className={`packs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Search & Sort Bar */}
                    <div className="packs-controls-row">
                        <div className="packs-search-container">
                            <svg className="packs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search packs by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="packs-search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="packs-clear-search"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="packs-sort-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="downloads">Most Downloaded</option>
                            <option value="title">Title A-Z</option>
                        </select>
                    </div>

                    {/* Active Filters */}
                    {(selectedAuthor || selectedGenres.length > 0 || searchQuery) && (
                        <div className="packs-active-filters">
                            <span className="packs-active-filters-label">Active filters:</span>
                            <div className="packs-filter-tags">
                                {selectedAuthor && (
                                    <span className="packs-filter-tag">
                    Author: {selectedAuthor}
                                        <button onClick={() => setSelectedAuthor('')}>✕</button>
                  </span>
                                )}
                                {selectedGenres.map(genre => (
                                    <span key={genre} className="packs-filter-tag">
                    {genre}
                                        <button onClick={() => handleGenreChange(genre, false)}>✕</button>
                  </span>
                                ))}
                                {searchQuery && (
                                    <span className="packs-filter-tag">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>✕</button>
                  </span>
                                )}
                            </div>
                            <button className="packs-clear-all-filters" onClick={handleClearFilters}>
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="packs-content-grid">
                        <aside className="packs-sidebar">
                            <PacksFilterSidebar
                                availableAuthors={metadata?.availableArtists || []}
                                availableGenres={metadata?.availableGenres || []}
                                selectedAuthor={selectedAuthor}
                                selectedGenres={selectedGenres}
                                priceRange={priceRange}
                                onAuthorChange={handleAuthorChange}
                                onGenreChange={handleGenreChange}
                                onPriceRangeChange={handlePriceRangeChange}
                                onClearFilters={handleClearFilters}
                                totalPacks={metadata?.totalPacks || 0}
                                filteredCount={packs.length}
                                minPrice={metadata?.minPrice || 0}
                                maxPrice={metadata?.maxPrice || 100}
                            />
                        </aside>

                        <section className="packs-content-area">
                            <PacksGrid
                                packs={packs}
                                viewMode={viewMode}
                                emptyStateMessage={{
                                    title: 'No packs found',
                                    description: 'Try adjusting your search or filters',
                                    showClearFilters: true
                                }}
                                onClearFilters={handleClearFilters}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="packs-pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="pagination-btn"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="pagination-info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="pagination-btn"
                                    >
                                        Next →
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