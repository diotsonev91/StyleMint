// src/components/PackForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioPackService } from '../../services/audioPackService';
import { checkAuth } from '../../api/auth';
import { 
  MusicalKey, 
  MusicalScale, 
  SampleType, 
  Genre, 
  InstrumentGroup
} from '../../types/audioEnums';
import { SamplesFromPackDTO } from '../../types';
import { PackFormHeader } from './PackForm/PackFormHeader';
import { PackFormProgress } from './PackForm/PackFormProgress';
import { PackInfoStep } from './PackForm/PackInfoStep';
import { SamplesStep } from './PackForm/SamplesStep';
import { PackFormActions } from './PackForm/PackFormActions';
import './PackForm.css';

export interface PackSample {
  id: string;
  file: File;
  name: string;
  artist: string;
  duration?: number;
  bpm?: number;
  musicalKey?: MusicalKey;
  musicalScale?: MusicalScale;
  genre?: Genre;
  sampleType: SampleType;
  instrumentGroup: InstrumentGroup;
  audioUrl?: string;
  isExisting?: boolean; // Flag to identify existing samples from user's library
  existingSampleId?: string; // ID of the existing sample (for backend reference)
}

export interface PackFormData {
  packTitle: string;
  artist: string;
  price: string;
  coverImage: File | null;
  coverPreview: string;
  description: string;
  selectedGenres: Genre[];
  tags: string[];
  samples: PackSample[];
}

interface PackFormProps {
  mode: 'upload' | 'edit';
  initialData?: Partial<PackFormData>;
  packId?: string;
  onSubmit?: (data: PackFormData) => Promise<void>;
  onCancel?: () => void;
}

const PackForm: React.FC<PackFormProps> = ({ 
  mode, 
  initialData, 
  packId, 
  onSubmit,
  onCancel 
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [step, setStep] = useState<1 | 2>(1);
  
  // Form state
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
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Audio playback state
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          sessionStorage.setItem('redirectAfterLogin', mode === 'upload' ? '/upload-pack' : `/edit-pack/${packId}`);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [navigate, mode, packId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      formData.samples.forEach(sample => {
        if (sample.audioUrl && !sample.isExisting) {
          URL.revokeObjectURL(sample.audioUrl);
        }
      });
    };
  }, [formData.samples]);

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

  // Sample handlers
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
          isExisting: false,
        };
      });
      
      updateSamples([...formData.samples, ...newSamples]);
      setSubmitError(null);
    }
  };

  // Handler for adding existing samples
  const handleAddExistingSamples = (existingSamples: SamplesFromPackDTO[]) => {
    const newSamples: PackSample[] = existingSamples.map(sample => ({
      id: `existing-${sample.id}`, // Prefix to identify existing samples
      file: new File([], ''), // Empty file placeholder - not needed for existing samples
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
      isExisting: true,
      existingSampleId: sample.id, // Store the actual sample ID for backend
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
    if (sample?.audioUrl && !sample.isExisting) {
      URL.revokeObjectURL(sample.audioUrl);
    }

    updateSamples(formData.samples.filter(sample => sample.id !== id));
  };

  // Validation
  const isStep1Valid = () => {
    return formData.packTitle.trim() !== '' && 
           formData.artist.trim() !== '' && 
           formData.price !== '' && 
           formData.coverImage !== null && 
           formData.description.trim() !== '' &&
           formData.selectedGenres.length > 0;
  };

  const isStep2Valid = () => {
    return formData.samples.length > 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStep2Valid()) {
      setSubmitError('Please add at least one sample to your pack.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitProgress(0);

      if (mode === 'upload') {
        // Separate new samples from existing samples
        const newSamples = formData.samples.filter(s => !s.isExisting);
        const existingSampleIds = formData.samples
          .filter(s => s.isExisting)
          .map(s => s.existingSampleId!)
          .filter(id => id); // Filter out any undefined IDs

        const response = await audioPackService.uploadPackWithProgress(
          {
            title: formData.packTitle,
            artist: formData.artist,
            price: formData.price,
            description: formData.description,
            genres: formData.selectedGenres,
            tags: formData.tags,
            coverImage: formData.coverImage,
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
            existingSampleIds, // Add existing sample IDs to the request
          },
          (progress) => {
            setSubmitProgress(Math.round(progress));
          }
        );

        if (response.success) {
          setSubmitSuccess(true);
          setTimeout(() => {
            resetForm();
            navigate('/my-packs');
          }, 2000);
        } else {
          handleSubmitError(response.error || 'Upload failed. Please try again.');
        }
      } else if (mode === 'edit' && packId) {
        // For edit mode, separate new and existing samples
        const newSamples = formData.samples.filter(s => !s.isExisting && !s.id.includes('existing-'));
        const existingSampleIds = formData.samples
          .filter(s => s.isExisting)
          .map(s => s.existingSampleId!)
          .filter(id => id);

        const response = await audioPackService.updatePackWithProgress(
          packId,
          {
            title: formData.packTitle,
            artist: formData.artist,
            price: formData.price,
            description: formData.description,
            genres: formData.selectedGenres,
            tags: formData.tags,
            coverImage: formData.coverImage,
            samplesToAdd: newSamples.map(sample => ({
              file: sample.file,
              name: sample.name,
              artist: sample.artist,
              bpm: sample.bpm,
              musicalKey: sample.musicalKey,
              musicalScale: sample.musicalScale,
              sampleType: sample.sampleType,
              instrumentGroup: sample.instrumentGroup,
              individualPrice: '0'
            })),
            existingSamplesToAdd: existingSampleIds, // Add existing samples by ID
            samplesToRemove: [],
            samplePricing: {}
          },
          (progress) => {
            setSubmitProgress(Math.round(progress));
          }
        );

        if (response.success) {
          setSubmitSuccess(true);
          setTimeout(() => {
            navigate('/my-packs');
          }, 2000);
        } else {
          handleSubmitError(response.error || 'Update failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      handleSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const handleSubmitError = (error: string) => {
    if (error?.includes('401') || error?.includes('unauthorized') || error?.includes('Session expired')) {
      setSubmitError('Session expired. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else if (error?.includes('network') || error?.includes('Failed to fetch')) {
      setSubmitError('Network error. Please check your connection and try again.');
    } else {
      setSubmitError(error);
    }
  };

  const resetForm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSampleId(null);

    formData.samples.forEach(sample => {
      if (sample.audioUrl && !sample.isExisting) {
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/my-packs');
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="pack-form-page">
        <div className="form-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="form-container">
          <div className="auth-check-container">
            <div className="spinner-large"></div>
            <p>Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pack-form-page">
        <div className="form-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="form-container">
          <div className="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Authentication Required</strong>
              <p>You must be logged in to {mode} sample packs. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pack-form-page">
      <div className="form-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="form-container">
        <PackFormHeader 
          mode={mode}
          title={mode === 'upload' ? 'Upload Sample Pack' : 'Edit Sample Pack'}
          subtitle={mode === 'upload' ? 'Share your sounds with the community' : 'Update your sample pack'}
        />

        <PackFormProgress step={step} />

        {submitError && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sample pack {mode === 'upload' ? 'uploaded' : 'updated'} successfully!
            {mode === 'upload' && ' Redirecting to your packs...'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="pack-form">
          {step === 1 && (
            <PackInfoStep
              formData={formData}
              onFormDataChange={updateFormData}
              onCoverImageChange={handleCoverImageChange}
              onToggleGenre={toggleGenre}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              isSubmitting={isSubmitting}
              onNext={() => setStep(2)}
              isStepValid={isStep1Valid()}
            />
          )}

          {step === 2 && (
            <SamplesStep
              formData={formData}
              onSampleUpload={handleSampleUpload}
              onAddExistingSamples={handleAddExistingSamples}
              onUpdateSample={updateSample}
              onRemoveSample={removeSample}
              onPlaySample={handlePlaySample}
              playingSampleId={playingSampleId}
              isSubmitting={isSubmitting}
              isStepValid={isStep2Valid()}
              onSubmitProgress={submitProgress}
              onBack={() => setStep(1)}
              mode={mode}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default PackForm;