// src/components/PackForm/helpers/packDataLoader.ts
// Helper function to convert pack data from API into proper form data for editing

import { PackFormData, PackSample } from './types';
import { SampleType, InstrumentGroup, Genre, MusicalKey, MusicalScale } from '../../../types/audioEnums';

// ✅ CRITICAL: Backend returns { pack: {...}, samples: [...] }
interface PackResponseFromAPI {
    pack: {
        id: string;
        title: string;
        artist: string;
        price: number;
        description: string;
        coverImage?: string;  // Note: backend uses 'coverImage', not 'coverImageUrl'
        genres: string[];
        tags: string[];
    };
    samples: Array<{
        id: string;
        name: string;
        artist: string;
        audioUrl: string;
        duration?: number;
        bpm?: number;
        key?: string;
        scale?: string;
        genre?: string;
        sampleType: string;
        instrumentGroup: string;
    }>;
}

/**
 * ✅ Converts pack data from API into proper PackFormData for editing
 * This ensures all samples are marked as isAlreadyInPack = true
 *
 * CRITICAL: Backend returns structure { pack: {...}, samples: [...] }
 */
export const loadPackForEditing = (apiResponse: PackResponseFromAPI): Partial<PackFormData> => {
    const { pack, samples } = apiResponse;

    console.log('🔄 Loading pack for editing - RAW API RESPONSE:', {
        packId: pack.id,
        packTitle: pack.title,
        samplesCount: samples?.length || 0,
        samples: samples?.map(s => ({ id: s.id, name: s.name })) || []
    });

    // ✅ Handle case where samples might be undefined or null
    const samplesList = samples || [];

    const convertedSamples: PackSample[] = samplesList.map(sample => {
        const packSample: PackSample = {
            id: `existing-${sample.id}`,           // Prefixed ID to distinguish
            file: null,                            // ✅ FIX: Use null for existing samples
            name: sample.name,
            artist: sample.artist,
            duration: sample.duration,
            bpm: sample.bpm,
            musicalKey: sample.key as MusicalKey,
            musicalScale: sample.scale as MusicalScale,
            genre: sample.genre as Genre,
            sampleType: sample.sampleType as SampleType,
            instrumentGroup: sample.instrumentGroup as InstrumentGroup,
            audioUrl: sample.audioUrl,
            isFromLibrary: true,                   // ✅ CRITICAL: Pack samples ARE from library
            isAlreadyInPack: true,                 // ✅ CRITICAL: AND they are already in this pack
            existingSampleId: sample.id,           // Store the actual sample ID
        };

        console.log(`✅ Converted sample: ${sample.name}`, {
            id: packSample.id,
            isFromLibrary: packSample.isFromLibrary,
            isAlreadyInPack: packSample.isAlreadyInPack,
            existingSampleId: packSample.existingSampleId,
            file: packSample.file
        });

        return packSample;
    });

    const formData: Partial<PackFormData> = {
        packTitle: pack.title,
        artist: pack.artist,
        price: pack.price.toString(),
        coverPreview: pack.coverImage || '',  // ✅ Backend uses 'coverImage'
        coverImage: null,
        description: pack.description,
        selectedGenres: pack.genres as Genre[],
        tags: pack.tags || [],
        samples: convertedSamples,
    };

    console.log('✅ FINAL Loaded form data:', {
        packTitle: formData.packTitle,
        samplesCount: formData.samples?.length,
        samples: formData.samples?.map(s => ({
            name: s.name,
            isFromLibrary: s.isFromLibrary,
            isAlreadyInPack: s.isAlreadyInPack,
            existingSampleId: s.existingSampleId
        }))
    });

    return formData;
};