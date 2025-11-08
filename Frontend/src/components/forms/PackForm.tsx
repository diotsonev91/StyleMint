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
  duration?: string;
  bpm?: number;
  musicalKey?: MusicalKey;
  musicalScale?: MusicalScale;
  genre?: Genre;
  sampleType: SampleType;
  instrumentGroup: InstrumentGroup;
  audioUrl?: string;
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
        if (sample.audioUrl) {
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
        };
      });
      
      updateSamples([...formData.samples, ...newSamples]);
      setSubmitError(null);
    }
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
    if (sample?.audioUrl) {
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
    return formData.samples.length >= 1;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitError('You must be logged in to ' + mode + ' sample packs');
      navigate('/login');
      return;
    }
    
    if (!isStep2Valid()) {
      setSubmitError('Please add at least 1 sample');
      return;
    }

    if (!formData.coverImage) {
      setSubmitError('Cover image is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitProgress(0);

    try {
      if (onSubmit) {
        // Use custom onSubmit if provided
        await onSubmit(formData);
      } else if (mode === 'upload') {
        // Default upload behavior
        const samplesData = formData.samples.map(sample => ({
          file: sample.file,
          name: sample.name,
          artist: sample.artist,
          bpm: sample.bpm,
          musicalKey: sample.musicalKey,
          musicalScale: sample.musicalScale,
          genre: sample.genre,
          sampleType: sample.sampleType,
          instrumentGroup: sample.instrumentGroup,
        }));

        const response = await audioPackService.uploadPackWithProgress(
          {
            title: formData.packTitle,
            artist: formData.artist,
            price: formData.price,
            description: formData.description,
            genres: formData.selectedGenres,
            tags: formData.tags,
            coverImage: formData.coverImage,
            samples: samplesData,
          },
          (progress) => {
            setSubmitProgress(Math.round(progress));
          }
        );

        if (response.success) {
          setSubmitSuccess(true);
          setTimeout(() => {
            resetForm();
            if (mode === 'upload') {
              navigate('/my-packs');
            }
          }, 3000);
        } else {
          handleSubmitError(response.error || `${mode} failed. Please try again.`);
        }
      } else {
        // Edit mode - would call update service here
        console.log('Edit mode - implement update service call');
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/my-packs');
        }, 3000);
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
    if (error?.includes('401') || error?.includes('unauthorized')) {
      setSubmitError('Session expired. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      if (sample.audioUrl) {
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
          title={mode === 'upload' ? 'Upload Sample ' : 'Edit Sample '}
          subtitle="Share your sounds with the community"
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
              onUpdateSample={updateSample}
              onRemoveSample={removeSample}
              onPlaySample={handlePlaySample}
              playingSampleId={playingSampleId}
              isSubmitting={isSubmitting}
              isStepValid={isStep2Valid()}
              onSubmitProgress={submitProgress}
              onBack={() => setStep(1)}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default PackForm;