// src/components/PackForm/SubmissionHandler.ts
import { audioPackService } from '../../../services/audioPackService';
import {PackFormData, PackSample} from './types';

export class SubmissionHandler {
    constructor(
        private mode: 'upload' | 'edit',
        private packId: string | undefined,
        private formData: PackFormData,
        private setIsSubmitting: (submitting: boolean) => void,
        private setSubmitProgress: (progress: number) => void,
        private setSubmitError: (error: string | null) => void,
        private setSubmitSuccess: (success: boolean) => void,
        private navigate: (path: string) => void,
        private resetForm: () => void
    ) {}

    async handleSubmit() {
        console.log("HANDLE SUBMIT")
        if (!this.isStep2Valid()) {
            this.setSubmitError('Please add at least one sample to your pack.');
            return;
        }

        try {
            this.setIsSubmitting(true);
            this.setSubmitError(null);
            this.setSubmitProgress(0);

            if (this.mode === 'upload') {
                await this.handleUpload();
            } else if (this.mode === 'edit' && this.packId) {
                console.log("should call handle edit")
                await this.handleEdit();
            }
        } catch (error: any) {
            console.error(`${this.mode} error:`, error);
            this.handleSubmitError('An unexpected error occurred. Please try again.');
        } finally {
            this.setIsSubmitting(false);
            this.setSubmitProgress(0);
        }
    }

    private async handleUpload() {
        // For upload mode: distinguish between new file uploads and samples from library
        // ✅ DEFENSIVE: Check file exists and has size
        const newSamples = this.formData.samples.filter(s =>
            !s.isFromLibrary &&
            s.file &&
            s.file.size > 0
        );

        const existingSampleIds = this.formData.samples
            .filter(s => s.isFromLibrary)
            .map(s => s.existingSampleId!)
            .filter(id => id);

        const response = await audioPackService.uploadPackWithProgress(
            {
                title: this.formData.packTitle,
                artist: this.formData.artist,
                price: this.formData.price,
                description: this.formData.description,
                genres: this.formData.selectedGenres,
                tags: this.formData.tags,
                coverImage: this.formData.coverImage,
                samples: newSamples.map(sample => ({
                    file: sample.file,
                    name: sample.name,
                    artist: sample.artist,
                    bpm: sample.bpm,
                    musicalKey: sample.musicalKey,
                    musicalScale: sample.musicalScale,
                    genre: sample.genre,
                    sampleType: sample.sampleType,
                    instrumentGroup: sample.instrumentGroup,
                })),
                existingSampleIds,
            },
            (progress) => {
                this.setSubmitProgress(Math.round(progress));
            }
        );

        if (response.success) {
            this.setSubmitSuccess(true);
            setTimeout(() => {
                this.resetForm();
                this.navigate('/my-packs');
            }, 2000);
        } else {
            this.handleSubmitError(response.error || 'Upload failed. Please try again.');
        }
    }

    // ✅ FIXED: Correctly handle all sample states in edit mode
    private async handleEdit() {
        try {
            const originalPackResponse = await audioPackService.getPackById(this.packId!);
            if (!originalPackResponse.success) {
                throw new Error('Failed to fetch original pack data');
            }

            // ✅ CRITICAL FIX: Backend returns { pack: {...}, samples: [...] }
            const originalPackData = originalPackResponse.data;
            const originalPack = originalPackData.pack || originalPackData; // Handle both structures
            const originalSamples = originalPackData.samples || originalPack.samples || [];
            const currentSamples = this.formData.samples;

            console.log('🎯 CORRECTED Edit Analysis:');
            console.log('🔍 Original pack data structure:', originalPackData);
            console.log('🔍 Original pack:', originalPack);
            console.log('🔍 Original pack samples:', originalSamples.map(s => ({ id: s.id, name: s.name })));
            console.log('🔍 Current form samples:', currentSamples.map(s => ({
                id: s.id,
                name: s.name,
                isFromLibrary: s.isFromLibrary,
                isAlreadyInPack: s.isAlreadyInPack,
                existingSampleId: s.existingSampleId,
                hasFile: !!s.file
            })));

            // ✅ STATE 1: Samples to remove (were in original pack, but not in current)
            const samplesToRemove = originalSamples
                .filter(originalSample =>
                    !currentSamples.some(currentSample =>
                        currentSample.existingSampleId === originalSample.id
                    )
                )
                .map(s => s.id);

            // ✅ CRITICAL: Unbind samples from pack BEFORE updating pack
            if (samplesToRemove.length > 0) {
                console.log(`🗑️ Unbinding ${samplesToRemove.length} samples from pack...`);

                // Call unbind API for each removed sample
                for (const sampleId of samplesToRemove) {
                    console.log(`🗑️ Calling unbind for sample: ${sampleId}`);

                    const unbindResponse = await audioPackService.unbindSampleFromPack(
                        sampleId,
                        this.packId!
                    );

                    if (!unbindResponse.success) {
                        console.error(`❌ Failed to unbind sample ${sampleId}:`, unbindResponse.error);
                        throw new Error(`Failed to unbind sample: ${unbindResponse.error}`);
                    }

                    console.log(`✅ Successfully unbound sample ${sampleId}`);
                }

                console.log('✅ All samples unbound successfully');
            }

            // ✅ Create a Set of original sample IDs for quick lookup
            const originalSampleIds = new Set(originalSamples.map(s => s.id));

            // ✅ STATE 2 & 3: Process current samples correctly
            const { newUploads, libraryAdditions } = currentSamples.reduce((acc, sample) => {
                // ✅ CRITICAL FIX: Skip samples that were already in the original pack
                // These should NOT be added again or uploaded
                if (sample.existingSampleId && originalSampleIds.has(sample.existingSampleId)) {
                    console.log(`⏭️ Skipping original pack sample: ${sample.name} (ID: ${sample.existingSampleId})`);
                    return acc;
                }

                // STATE 2: Adding existing library samples (isFromLibrary=true, NOT already in pack)
                if (sample.isFromLibrary && sample.existingSampleId) {
                    console.log(`📚 Adding from library: ${sample.name} (ID: ${sample.existingSampleId})`);
                    acc.libraryAdditions.push(sample.existingSampleId);
                }
                // STATE 3: Uploading brand new samples (isFromLibrary=false, has file)
                else if (!sample.isFromLibrary && sample.file && sample.file.size > 0) {
                    console.log(`📤 Uploading new sample: ${sample.name}`);
                    acc.newUploads.push(sample);
                }
                // ⚠️ VALIDATION: Catch samples that don't fit any valid state
                else if (!sample.isFromLibrary && !sample.file) {
                    console.warn(`⚠️ Sample "${sample.name}" has no file but isn't from library or original pack - skipping`);
                }

                return acc;
            }, { newUploads: [] as PackSample[], libraryAdditions: [] as string[] });

            console.log('✅ FINAL CORRECTED Actions:', {
                samplesUnbound: samplesToRemove.length,
                newUploads: newUploads.map(s => s.name),
                libraryAdditions: libraryAdditions.length > 0 ? libraryAdditions : 'None'
            });

            // ✅ NOW submit the pack update (without samplesToRemove since they're already unbound)
            const response = await audioPackService.updatePackWithProgress(
                this.packId!,
                {
                    title: this.formData.packTitle,
                    artist: this.formData.artist,
                    price: this.formData.price,
                    description: this.formData.description,
                    genres: this.formData.selectedGenres,
                    tags: this.formData.tags,
                    coverImage: this.formData.coverImage,
                    samplesToAdd: newUploads.map(sample => ({
                        file: sample.file!,
                        name: sample.name,
                        artist: sample.artist,
                        bpm: sample.bpm,
                        musicalKey: sample.musicalKey,
                        musicalScale: sample.musicalScale,
                        sampleType: sample.sampleType,
                        instrumentGroup: sample.instrumentGroup,
                    })),
                    existingSamplesToAdd: libraryAdditions,
                    samplesToRemove: [], // ✅ Empty since we already unbound them above
                },
                (progress) => {
                    this.setSubmitProgress(Math.round(progress));
                }
            );

            if (response.success) {
                this.setSubmitSuccess(true);
                setTimeout(() => {
                    this.navigate('/my-packs');
                }, 2000);
            } else {
                this.handleSubmitError(response.error || 'Update failed. Please try again.');
            }

        } catch (error: any) {
            console.error('Edit submission error:', error);
            this.handleSubmitError(error.message || 'Failed to process pack update. Please try again.');
        }
    }

    private isStep2Valid() {
        return this.formData.samples.length > 0;
    }

    private handleSubmitError(error: string) {
        if (error?.includes('401') || error?.includes('unauthorized') || error?.includes('Session expired')) {
            this.setSubmitError('Session expired. Please log in again.');
            setTimeout(() => {
                this.navigate('/login');
            }, 2000);
        } else if (error?.includes('network') || error?.includes('Failed to fetch')) {
            this.setSubmitError('Network error. Please check your connection and try again.');
        } else {
            this.setSubmitError(error);
        }
    }
}