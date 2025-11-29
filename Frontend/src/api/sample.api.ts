import API from "./config";

const SAMPLE_BASE = "/audio/samples";

export const sampleApi = {

    async getSamplesPage(page = 0, size = 20, filters = {}) {
        return API.post(`${SAMPLE_BASE}/search?page=${page}&size=${size}`, filters);
    },

    async getSampleMetadata() {
        const [genres, keys, instruments] = await Promise.all([
            API.get(`${SAMPLE_BASE}/metadata/genres`),
            API.get(`${SAMPLE_BASE}/metadata/keys`),
            API.get(`${SAMPLE_BASE}/metadata/instruments`)
        ]);

        return {
            genres: genres.data,
            keys: keys.data,
            instruments: instruments.data
        };
    },

    async getSampleById(id: string) {
        return API.get(`${SAMPLE_BASE}/${id}`); 
    },

    async searchByName(name: string) {
        return API.get(`${SAMPLE_BASE}/search/name?name=${encodeURIComponent(name)}`);
    },

    async getMySamples() {
        return API.get(`${SAMPLE_BASE}/my-samples`);
    },

    async getStandaloneSamples(page = 0, size = 20) {
        return API.get(`${SAMPLE_BASE}/standalone?page=${page}&size=${size}`);
    },

    async getSamplesByGenre(genre: string, page = 0, size = 20) {
        return API.get(`${SAMPLE_BASE}/genre/${genre}?page=${page}&size=${size}`);
    },

    async getSamplesByType(type: string) {
        return API.get(`${SAMPLE_BASE}/type/${type}`);
    },

    async getSamplesByInstrument(instrument: string) {
        return API.get(`${SAMPLE_BASE}/instrument/${instrument}`);
    },

    async getSamplesByKey(key: string) {
        return API.get(`${SAMPLE_BASE}/key/${key}`);
    },

    async getSamplesByBpm(minBpm: number, maxBpm: number) {
        return API.get(`${SAMPLE_BASE}/bpm?minBpm=${minBpm}&maxBpm=${maxBpm}`);
    },

    async downloadSample(sampleId: string) {
        return API.get(`${SAMPLE_BASE}/${sampleId}/download`);
    }
};
