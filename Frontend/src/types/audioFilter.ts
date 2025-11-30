// src/types/audioFilter.ts

export interface SamplePackFilterRequest {
    artist?: string;
    title?: string;
    genres?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'price-low' | 'price-high' | 'downloads' | 'title';
}

export interface PackFilterMetadata {
    availableArtists: string[];
    availableGenres: string[];
    minPrice: number;
    maxPrice: number;
    totalPacks: number;
}

export interface FilterState {
    artist: string;
    genres: string[];
    minPrice: number;
    maxPrice: number;
    sortBy: string;
}