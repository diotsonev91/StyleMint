// src/components/PackForm/hooks/usePackForm.ts
import { useState, useRef, useEffect } from 'react';
import { PackFormData, PackSample } from '../PackForm/types';
import { SampleType, InstrumentGroup, Genre, MusicalKey, MusicalScale } from '../../../types/audioEnums';
import {audioPackService} from "../../../services/audioPackService";
import {loadPackForEditing} from "../PackForm/packDataLoader";
import {AudioSample} from "../../../types";

export const usePackForm = (mode: 'upload' | 'edit', initialData?: Partial<PackFormData>, packId?: string) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState<PackFormData>({
        packTitle: '',
        artist: '',
        price: '',
        coverImage: null,
        coverPreview: '',
        description: '',
        selectedGenres: [],
        tags: [],
        samples: [],
        // ✅ CORRECTED: Properly merge initialData to ensure all fields are set
        ...(initialData || {})
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            formData.samples.forEach(sample => {
                if (sample.audioUrl && !sample.isFromLibrary && !sample.isAlreadyInPack) {
                    URL.revokeObjectURL(sample.audioUrl);
                }
            });
        };
    }, [formData.samples]);



    useEffect(() => {
        if (mode === 'edit' && packId && !initialData) {
            const fetchAndLoadPack = async () => {
                try {
                    setIsSubmitting(true);
                    console.log('🔄 Fetching pack data for editing...');

                    const response = await audioPackService.getPackById(packId);

                    if (response.success) {
                        console.log('✅ Pack data fetched successfully:', response.data);
                        const loadedData = loadPackForEditing(response.data);

                        // ✅ CORRECTED: Completely replace form data with loaded data
                        setFormData(prev => ({
                            ...prev,
                            ...loadedData,
                            // Ensure samples array is properly set
                            samples: loadedData.samples || []
                        }));

                        console.log('✅ Form data after loading:', {
                            samples: loadedData.samples?.map(s => ({
                                name: s.name,
                                isFromLibrary: s.isFromLibrary,
                                isAlreadyInPack: s.isAlreadyInPack
                            }))
                        });
                    } else {
                        console.error('❌ Failed to fetch pack data');
                        setSubmitError('Failed to load pack for editing');
                    }
                } catch (error) {
                    console.error('❌ Failed to load pack for editing:', error);
                    setSubmitError('Error loading pack data');
                } finally {
                    setIsSubmitting(false);
                }
            };

            fetchAndLoadPack();
        }
    }, [mode, packId, initialData]);

    // Form data handlers
    const updateFormData = (field: keyof PackFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSamples = (samples: PackSample[]) => {
        updateFormData('samples', samples);
    };

    // Cover image handler
    const handleCoverImageChange = (file: File | null, preview: string) => {
        updateFormData('coverImage', file);
        updateFormData('coverPreview', preview);
        setSubmitError(null);
    };

    // Genre handler
    const toggleGenre = (genre: Genre) => {
        const newGenres = formData.selectedGenres.includes(genre)
            ? formData.selectedGenres.filter(g => g !== genre)
            : [...formData.selectedGenres, genre];

        updateFormData('selectedGenres', newGenres);
    };

    // Tag handler
    const addTag = (tag: string) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            updateFormData('tags', [...formData.tags, tag.trim()]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    // Audio playback handlers
    const handlePlaySample = (sample: PackSample) => {
        if (playingSampleId === sample.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingSampleId(null);
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(sample.audioUrl);
            audioRef.current = audio;

            audio.addEventListener('ended', () => {
                setPlayingSampleId(null);
            });

            audio.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setPlayingSampleId(null);
            });

            audio.play().catch(err => {
                console.error('Failed to play audio:', err);
                setPlayingSampleId(null);
            });

            setPlayingSampleId(sample.id);
        }
    };

    // ✅ CORRECTED: Handle sample upload for BOTH modes
    const handleSampleUpload = (files: FileList | null) => {
        if (files) {
            const newSamples: PackSample[] = Array.from(files).map(file => {
                const audioUrl = URL.createObjectURL(file);

                return {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    artist: formData.artist,
                    genre: formData.selectedGenres[0],
                    sampleType: SampleType.ONESHOT,
                    instrumentGroup: InstrumentGroup.DRUMS,
                    audioUrl,
                    isFromLibrary: false,      // ✅ New file upload (not from library)
                    isAlreadyInPack: false,    // ✅ Not in pack yet
                };
            });

            updateSamples([...formData.samples, ...newSamples]);
            setSubmitError(null);
        }
    };

// ✅ FIXED: Handle adding existing samples with null files
    const handleAddExistingSamples = (existingSamples: AudioSample[]) => {
        const newSamples: PackSample[] = existingSamples.map(sample => ({
            id: `library-${sample.id}`, // Prefixed ID to distinguish
            file: null,                 // ✅ FIX: Use null for library samples
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
            isFromLibrary: true,        // From library
            isAlreadyInPack: false,     // NOT already in THIS pack
            existingSampleId: sample.id, // Store the actual library sample ID
        }));

        updateSamples([...formData.samples, ...newSamples]);
        setSubmitError(null);
    };

    const updateSample = (id: string, field: keyof PackSample, value: any) => {
        const updatedSamples = formData.samples.map(sample =>
            sample.id === id ? { ...sample, [field]: value } : sample
        );
        updateSamples(updatedSamples);
    };

    const removeSample = (id: string) => {
        if (playingSampleId === id && audioRef.current) {
            audioRef.current.pause();
            setPlayingSampleId(null);
        }

        const sample = formData.samples.find(s => s.id === id);
        if (sample?.audioUrl && !sample.isFromLibrary && !sample.isAlreadyInPack) {
            URL.revokeObjectURL(sample.audioUrl);
        }

        updateSamples(formData.samples.filter(sample => sample.id !== id));
    };

    // Validation
    const hasValidCoverImage = () => {
        if (mode === 'edit') {
            return formData.coverPreview !== '' || formData.coverImage !== null;
        }
        return formData.coverImage !== null;
    };

    const isStep1Valid = () => {
        return formData.packTitle.trim() !== '' &&
            formData.artist.trim() !== '' &&
            formData.price !== '' &&
            hasValidCoverImage() &&
            formData.description.trim() !== '' &&
            formData.selectedGenres.length > 0;
    };

    const isStep2Valid = () => {
        return formData.samples.length > 0;
    };

    const resetForm = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingSampleId(null);

        formData.samples.forEach(sample => {
            if (sample.audioUrl && !sample.isFromLibrary && !sample.isAlreadyInPack) {
                URL.revokeObjectURL(sample.audioUrl);
            }
        });

        setStep(1);
        setFormData({
            packTitle: '',
            artist: '',
            price: '',
            coverImage: null,
            coverPreview: '',
            description: '',
            selectedGenres: [],
            tags: [],
            samples: [],
            ...initialData
        });
        setSubmitError(null);
        setSubmitSuccess(false);
        setSubmitProgress(0);
    };

    return {
        formData,
        step,
        isSubmitting,
        submitProgress,
        submitError,
        submitSuccess,
        playingSampleId,
        audioRef,
        updateFormData,
        updateSamples,
        setStep,
        setIsSubmitting,
        setSubmitProgress,
        setSubmitError,
        setSubmitSuccess,
        setPlayingSampleId,
        handleCoverImageChange,
        toggleGenre,
        addTag,
        removeTag,
        handlePlaySample,
        handleSampleUpload,
        handleAddExistingSamples,
        updateSample,
        removeSample,
        isStep1Valid,
        isStep2Valid,
        resetForm
    };
};