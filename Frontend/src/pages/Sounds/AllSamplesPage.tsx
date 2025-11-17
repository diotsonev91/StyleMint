// src/components/AllSamplesPage.tsx

import React, { useState, useEffect } from 'react';
import FilterSidebar from '../../components/sounds/FilterSidebar';
import SamplesList from '../../components/sounds/SamplesList';
import './AllSamplesPage.css';
import { sampleApi } from "../../api/sample.api";
import { AudioSample } from "../../types";

const AllSamplesPage: React.FC = () => {

    const [allSamples, setAllSamples] = useState<AudioSample[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedGenre, setSelectedGenre] = useState<string>('');
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectedInstrument, setSelectedInstrument] = useState<string>('');
    const [selectedType, setSelectedType] = useState<'all' | 'ONESHOT' | 'LOOP'>('all');

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [availableKeys, setAvailableKeys] = useState<string[]>([]);
    const [availableInstruments, setAvailableInstruments] = useState<string[]>([]);


    // === Build filter request ===
    const buildFilters = () => ({
        genre: selectedGenre || null,
        musicalKey: selectedKey || null,
        instrumentGroup: selectedInstrument || null,
        sampleType: selectedType !== "all" ? selectedType : null
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const meta = await sampleApi.getSampleMetadata();
                setAvailableGenres(meta.genres);
                setAvailableKeys(meta.keys);
                setAvailableInstruments(meta.instruments);
            } catch (err) {
                console.error("Failed to load metadata:", err);
            }
        };

        fetchMetadata();
    }, []);


    // === Load first page OR filters changed ===
    useEffect(() => {
        const fetchFirstPage = async () => {
            setLoading(true);

            const filters = buildFilters();
            const res = await sampleApi.getSamplesPage(0, 20, filters);
            const json = res.data;

            setAllSamples(json.content ?? []);
            setPage(0);
            setTotalPages(json.totalPages);
            setLoading(false);
        };

        fetchFirstPage();
    }, [selectedGenre, selectedKey, selectedInstrument, selectedType]);

    // === Load More ===
    const handleLoadMore = async () => {
        if (page + 1 >= totalPages) return;

        const nextPage = page + 1;
        const filters = buildFilters();

        const res = await sampleApi.getSamplesPage(nextPage, 20, filters);
        const json = res.data;


        setAllSamples(prev => [...prev, ...(json.content ?? [])]);
        setPage(nextPage);
    };


    const filteredSamples = allSamples; // backend filtering

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
                    Type: {selectedType === 'ONESHOT' ? 'One-Shot' : 'Loop'}
                                        <button className="remove-filter" onClick={() => setSelectedType('all')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                                )}

                                {selectedGenre && (
                                    <span className="filter-tag">
                    Genre: {selectedGenre}
                                        <button className="remove-filter" onClick={() => setSelectedGenre('')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                                )}

                                {selectedInstrument && (
                                    <span className="filter-tag">
                    Instrument: {selectedInstrument}
                                        <button className="remove-filter" onClick={() => setSelectedInstrument('')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                                )}

                                {selectedKey && (
                                    <span className="filter-tag">
                    Key: {selectedKey}
                                        <button className="remove-filter" onClick={() => setSelectedKey('')}>
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
                                onGenreChange={setSelectedGenre}
                                onKeyChange={setSelectedKey}
                                onInstrumentChange={setSelectedInstrument}
                                onTypeChange={setSelectedType}
                                onClearAll={() => {
                                    setSelectedGenre('');
                                    setSelectedKey('');
                                    setSelectedInstrument('');
                                    setSelectedType('all');
                                }}
                                totalSamples={allSamples.length}
                                filteredCount={filteredSamples.length}
                            />
                        </aside>

                        {/* Samples List */}
                        <section className="content-area">

                            {filteredSamples.length > 0 ? (
                                <>
                                    <SamplesList
                                        samples={filteredSamples}
                                        onLoadMore={handleLoadMore}
                                    />

                                    {/* Load More */}
                                    {page + 1 < totalPages && (
                                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                                            <button className="btn btn-primary" onClick={handleLoadMore}>
                                                Load More
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-results-message">
                                    <svg className="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3>No samples found</h3>
                                    <p>Try adjusting your filters to see more results</p>
                                    <button className="btn btn-primary" onClick={() => {
                                        setSelectedGenre('');
                                        setSelectedKey('');
                                        setSelectedInstrument('');
                                        setSelectedType('all');
                                    }}>
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
