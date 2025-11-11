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

    // src/components/PackForm/SubmissionHandler.ts
    private async handleEdit() {
        try {
            const originalPackResponse = await audioPackService.getPackById(this.packId!);
            if (!originalPackResponse.success) {
                throw new Error('Failed to fetch original pack data');
            }

            const originalPack = originalPackResponse.data;
            const originalSamples = originalPack.samples || [];
            const currentSamples = this.formData.samples;

            console.log('🎯 SIMPLIFIED Edit Analysis:');

            // ✅ STATE 1: Samples to remove (were in original pack, but not in current)
            const samplesToRemove = originalSamples
                .filter(originalSample =>
                    !currentSamples.some(currentSample =>
                        currentSample.existingSampleId === originalSample.id
                    )
                )
                .map(s => s.id);

            // ✅ STATE 2 & 3: Separate current samples by type
            const { newUploads, libraryAdditions } = currentSamples.reduce((acc, sample) => {
                // STATE 2: Adding existing library samples (isFromLibrary=true, isAlreadyInPack=false)
                if (sample.isFromLibrary && !sample.isAlreadyInPack && sample.existingSampleId) {
                    acc.libraryAdditions.push(sample.existingSampleId);
                }
                // STATE 3: Uploading new samples (isFromLibrary=false, isAlreadyInPack=false)
                else if (!sample.isFromLibrary && !sample.isAlreadyInPack) {
                    if (!sample.file || sample.file.size <= 0) {
                        throw new Error(`Sample "${sample.name}" is missing a valid audio file`);
                    }
                    acc.newUploads.push(sample);
                }
                // Ignore original pack samples (isFromLibrary=true, isAlreadyInPack=true) - they stay as-is
                return acc;
            }, { newUploads: [] as PackSample[], libraryAdditions: [] as string[] });

            console.log('✅ FINAL SIMPLIFIED Actions:', {
                samplesToRemove,
                newUploads: newUploads.map(s => s.name),
                libraryAdditions
            });

            // Validate we have work to do
            if (samplesToRemove.length === 0 && newUploads.length === 0 && libraryAdditions.length === 0) {
                console.log('ℹ️ No changes detected in samples');
            }

            // Submit the update
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
                    samplesToRemove: samplesToRemove,
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