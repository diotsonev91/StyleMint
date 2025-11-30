// Add these methods to your packApi.ts (or create new file)

import  API  from './config';
import { SamplePackFilterRequest, PackFilterMetadata } from '../types/audioFilter';

const PACK_BASE = '/audio/packs';

export const packFilterApi = {
    /**
     * Filter packs with advanced options
     */
    async filterPacks(filterRequest: SamplePackFilterRequest, page: number = 0, size: number = 20) {
        const response = await API.post(`${PACK_BASE}/filter`, filterRequest, {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Get filter metadata (artists, genres, price range)
     */
    async getFilterMetadata(): Promise<PackFilterMetadata> {
        const response = await API.get(`${PACK_BASE}/filter-metadata`);
        return response.data;
    },

    /**
     * Get all distinct artists
     */
    async getAllArtists(): Promise<string[]> {
        const response = await API.get(`${PACK_BASE}/artists`);
        return response.data;
    },

    /**
     * Get all distinct genres
     */
    async getAllGenres(): Promise<string[]> {
        const response = await API.get(`${PACK_BASE}/genres`);
        return response.data;
    }
};

// Alternative: Add to existing packApi object
export const packApi = {
    // ... existing methods ...

    filterPacks: async (filterRequest: SamplePackFilterRequest, page: number = 0, size: number = 20) => {
        const response = await API.post(`${PACK_BASE}/filter`, filterRequest, {
            params: { page, size }
        });
        return response.data;
    },

    getFilterMetadata: async (): Promise<PackFilterMetadata> => {
        const response = await API.get(`${PACK_BASE}/filter-metadata`);
        return response.data;
    },

    getAllArtists: async (): Promise<string[]> => {
        const response = await API.get(`${PACK_BASE}/artists`);
        return response.data;
    },

    getAllGenres: async (): Promise<string[]> => {
        const response = await API.get(`${PACK_BASE}/genres`);
        return response.data;
    }
};