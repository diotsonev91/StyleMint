// src/components/PackForm/helpers/packDataLoader.ts
// Helper function to convert pack data from API into proper form data for editing

import { PackFormData, PackSample } from './types';
import { SampleType, InstrumentGroup, Genre, MusicalKey, MusicalScale } from '../../../types/audioEnums';

interface PackFromAPI {
    id: string;
    title: string;
    artist: string;
    price: number;
    description: string;
    coverImageUrl?: string;
    genres: string[];
    tags: string[];
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
 */
export const loadPackForEditing = (packData: PackFromAPI): Partial<PackFormData> => {
    console.log('🔄 Loading pack for editing - RAW DATA:', {
        packId: packData.id,
        samplesCount: packData.samples.length,
        samples: packData.samples.map(s => ({ id: s.id, name: s.name }))
    });

    const samples: PackSample[] = packData.samples.map(sample => {
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
        packTitle: packData.title,
        artist: packData.artist,
        price: packData.price.toString(),
        coverPreview: packData.coverImageUrl || '',
        coverImage: null,
        description: packData.description,
        selectedGenres: packData.genres as Genre[],
        tags: packData.tags || [],
        samples: samples,
    };

    console.log('✅ FINAL Loaded form data:', {
        samples: formData.samples?.map(s => ({
            name: s.name,
            isFromLibrary: s.isFromLibrary,
            isAlreadyInPack: s.isAlreadyInPack
        }))
    });

    return formData;
};
