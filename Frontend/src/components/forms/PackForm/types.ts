// src/components/PackForm/types.ts
import { Genre, MusicalKey, MusicalScale, SampleType, InstrumentGroup } from '../../../types/audioEnums';

/**
 * Represents a sample in the pack form
 *
 * 🎯 KEY FLAGS EXPLAINED:
 *
 * isFromLibrary: Indicates sample was selected from user's existing library
 *                (not uploaded as a new file in this session)
 *
 * isAlreadyInPack: Indicates sample was already part of the pack before editing
 *                  (only relevant in edit mode)
 *
 * /**
 *  * STATE COMBINATIONS:
 *  * ┌─────────────────┬───────────────┬─────────────────┬──────────────────────────┐
 *  * │ Scenario        │ isFromLibrary │ isAlreadyInPack │ Description              │
 *  * ├─────────────────┼───────────────┼─────────────────┼──────────────────────────┤
 *  * │ Upload: New     │     false     │      false      │ New file upload          │
 *  * │ Upload: Library │     true      │      false      │ From existing library    │
 *  * │ Edit: Original  │     true      │      true       │ Was in pack originally   │
 *  * │ Edit: Added     │     true      │      false      │ Added from library       │
 *  * │ Edit: New       │     false     │      false      │ New file upload in edit  │
 *  * └─────────────────┴───────────────┴─────────────────┴──────────────────────────┘
 *  */
export interface PackSample {
    /** Unique identifier for this sample in the form (may be temporary) */
    id: string;

    /** The audio file (null for existing library/pack samples) */
    file: File | null;

    /** Display name of the sample */
    name: string;

    /** Artist who created the sample */
    artist: string;

    /** Duration in seconds (optional) */
    duration?: number;

    /** Tempo in beats per minute (optional) */
    bpm?: number;

    /** Musical key (optional) */
    musicalKey?: MusicalKey;

    /** Musical scale (optional) */
    musicalScale?: MusicalScale;

    /** Genre classification (optional) */
    genre?: Genre;

    /** Type of sample (loop, one-shot, etc.) */
    sampleType: SampleType;

    /** Instrument category */
    instrumentGroup: InstrumentGroup;

    /** URL for audio playback preview */
    audioUrl: string;

    // ✅ CRITICAL STATE FLAGS - DO NOT CONFUSE THESE!

    /**
     * TRUE when sample was selected from user's existing library
     * FALSE when sample is a new file upload
     */
    isFromLibrary: boolean;

    /**
     * TRUE when sample was already part of the pack being edited
     * FALSE when sample is newly added (whether file or library)
     * Only relevant in edit mode
     */
    isAlreadyInPack: boolean;

    /**
     * The actual sample ID from the database
     * - Used when isFromLibrary=true (references library sample)
     * - Used when isAlreadyInPack=true (references pack's sample)
     */
    existingSampleId?: string;
}

/**
 * Complete form data for pack upload/edit
 */
export interface PackFormData {
    /** Pack title */
    packTitle: string;

    /** Artist/producer name */
    artist: string;

    /** Price in USD (as string for form input) */
    price: string;

    /** Cover image file (null if not changed in edit mode) */
    coverImage: File | null;

    /** Base64 preview URL for cover image */
    coverPreview: string;

    /** Pack description/details */
    description: string;

    /** Selected genre tags */
    selectedGenres: Genre[];

    /** Additional custom tags */
    tags: string[];

    /** All samples in the pack */
    samples: PackSample[];
}

/**
 * Helper type guards for sample state checking
 */
export const SampleStateChecks = {
    /**
     * Check if sample is a brand new file upload
     */
    isNewUpload: (sample: PackSample): boolean => {
        return !sample.isFromLibrary && !sample.isAlreadyInPack;
    },

    /**
     * Check if sample can be edited
     * (only new uploads can be edited, library and pack samples are read-only)
     */
    isEditable: (sample: PackSample): boolean => {
        return !sample.isFromLibrary && !sample.isAlreadyInPack;
    },

    /**
     * Check if sample has a database ID
     */
    hasExistingId: (sample: PackSample): boolean => {
        return !!sample.existingSampleId;
    },

    /**
     * Get display badge text for sample
     */
    getBadgeText: (sample: PackSample): string | null => {
        if (sample.isAlreadyInPack) return 'In Pack';
        if (sample.isFromLibrary) return 'From Library';
        return null;
    }
};