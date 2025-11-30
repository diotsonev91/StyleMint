// pack_api.ts - Sample Pack API calls

import API from "./config";

const PACK_BASE = "/audio/packs";

export const packApi = {

    /**
     * Get pack by ID with all samples
     */
    async getPackWithSamples(packId: string) {
        return API.get(`${PACK_BASE}/${packId}/detail`);
    },

    /**
     * Get all packs
     */
    async getAllPacks(page = 0, size = 20) {
        return API.get(`${PACK_BASE}/all?page=${page}&size=${size}`);
    },

    /**
     * Get my packs
     */
    async getMyPacks() {
        return API.get(`${PACK_BASE}/my-packs`);
    },

    /**
     * Search packs
     */
    async searchPacks(filters = {}, page = 0, size = 20) {
        return API.post(`${PACK_BASE}/search?page=${page}&size=${size}`, filters);
    },

    /**
     * Download entire pack (requires ownership or license)
     * Returns download info for all samples in pack
     */
    async downloadPack(packId: string) {
        return API.get(`${PACK_BASE}/${packId}/download`);
    },

    /**
     * ⭐ Download pack as ZIP file
     * Returns blob for direct file download
     */
    async downloadPackAsZip(packId: string) {
        return API.get(`${PACK_BASE}/${packId}/download-zip`, {
            responseType: 'blob' // ⭐ IMPORTANT: Get binary data
        });
    },
    async ratePack(packId: string, rating: number) {
        if (rating < 1.0 || rating > 5.0) {
            throw new Error("Rating must be between 1.0 and 5.0");
        }
        return API.post(`${PACK_BASE}/${packId}/rate?rating=${rating}`);
    },
    async getUserRating(packId: string) {
        return API.get(`${PACK_BASE}/${packId}/my-rating`);
    },
    /**
     * Get top rated packs
     */
    async getTopRatedPacks() {
        return API.get(`${PACK_BASE}/top-rated`);
    },

    /**
     * Get most downloaded packs
     */
    async getMostDownloadedPacks() {
        return API.get(`${PACK_BASE}/most-downloaded`);
    },

    /**
     * Get latest released packs
     */
    async getLatestPacks() {
        return API.get(`${PACK_BASE}/latest`);
    }
};