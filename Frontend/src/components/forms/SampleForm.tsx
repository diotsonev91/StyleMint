// src/components/SampleForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioSampleService } from '../../services/audioSampleService';
import { checkAuth } from '../../api/auth';
import { 
  MusicalKey, 
  MusicalScale, 
  SampleType, 
  Genre, 
  InstrumentGroup,
  getMusicalKeyDisplayName,
  getMusicalScaleDisplayName,
  getSampleTypeDisplayName,
  getInstrumentGroupDisplayName
} from '../../types/audioEnums';
import { SampleFormHeader } from './SampleForm/SampleFormHeader';
import { SampleFileUpload } from './SampleForm/SampleFileUpload';
import { SampleMetadataForm } from './SampleForm/SampleMetadataForm';
import { SampleFormActions } from './SampleForm/SampleFormActions';
import './SampleForm.css';

export interface SampleFormData {
  sampleFile?: File | null;
  name: string;
  artist: string;
  price: string;
  bpm?: number;
  musicalKey?: MusicalKey;
  musicalScale?: MusicalScale;
  genre?: Genre;
  sampleType?: SampleType;
  instrumentGroup?: InstrumentGroup;
  tags: string[];
}

interface SampleFormProps {
  mode: 'upload' | 'edit';
  initialData?: Partial<SampleFormData>;
  sampleId?: string;
  onSubmit?: (data: SampleFormData) => Promise<void>;
  onCancel?: () => void;
}

const SampleForm: React.FC<SampleFormProps> = ({ 
  mode, 
  initialData, 
  sampleId, 
  onSubmit,
  onCancel 
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<SampleFormData>({
    sampleFile: null,
    name: '',
    artist: '',
    price: '',
    bpm: undefined,
    musicalKey: undefined,
    musicalScale: undefined,
    genre: undefined,
    sampleType: undefined,
    instrumentGroup: undefined,
    tags: [],
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          sessionStorage.setItem('redirectAfterLogin', mode === 'upload' ? '/upload' : `/edit-sample/${sampleId}`);
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
  }, [navigate, mode, sampleId]);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({
        ...prev,
        sampleFile: file,
        name: prev.name || nameWithoutExtension
      }));
      setSubmitError(null);
    }
  };

  const handleInputChange = (field: keyof SampleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isAuthenticated) {
      setSubmitError('You must be logged in to ' + mode + ' samples');
      navigate('/login');
      return;
    }

    if (mode === 'upload' && !formData.sampleFile) {
      setSubmitError('Please select an audio file');
      return;
    }

    if (!formData.name || !formData.artist || !formData.price || !formData.sampleType || !formData.instrumentGroup) {
      setSubmitError('Please fill all required fields');
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
        const response = await audioSampleService.uploadSampleWithProgress(
          {
            file: formData.sampleFile!,
            name: formData.name,
            artist: formData.artist,
            price: formData.price,
            bpm: formData.bpm,
            musicalKey: formData.musicalKey,
            musicalScale: formData.musicalScale,
            genre: formData.genre,
            sampleType: formData.sampleType,
            instrumentGroup: formData.instrumentGroup,
            tags: formData.tags
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
              navigate('/my-samples');
            }
          }, 2000);
        } else {
          handleSubmitError(response.error || `${mode} failed. Please try again.`);
        }
      } else {
        // Edit mode - would call update service here
        console.log('Edit mode - implement update service call');
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/my-samples');
        }, 2000);
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
    setFormData({
      sampleFile: null,
      name: '',
      artist: '',
      price: '',
      bpm: undefined,
      musicalKey: undefined,
      musicalScale: undefined,
      genre: undefined,
      sampleType: undefined,
      instrumentGroup: undefined,
      tags: [],
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
      navigate('/my-samples');
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="sample-form-page">
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
      <div className="sample-form-page">
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
              <p>You must be logged in to {mode} samples. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sample-form-page">
      <div className="form-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="form-container">
        <SampleFormHeader 
          mode={mode}
          title={mode === 'upload' ? 'Upload Sample' : 'Edit Sample'}
          subtitle={mode === 'upload' 
            ? 'Share your individual sound with producers worldwide' 
            : 'Update your sample information'
          }
        />

        {submitSuccess && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sample {mode === 'upload' ? 'uploaded' : 'updated'} successfully!</span>
          </div>
        )}

        {submitError && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sample-form">
          {/* Audio File Upload - Only for upload mode or when editing without existing file */}
          {(mode === 'upload' ) && (
            <SampleFileUpload
              sampleFile={formData.sampleFile}
              onFileChange={handleFileChange}
              isSubmitting={isSubmitting}
              mode={mode}
            />
          )}

          {isSubmitting && submitProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${submitProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{submitProgress}% {mode === 'upload' ? 'uploaded' : 'processing'}</span>
            </div>
          )}

          {/* Sample Metadata */}
          <SampleMetadataForm
            formData={formData}
            onInputChange={handleInputChange}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            isSubmitting={isSubmitting}
            mode={mode}
          />

          {/* Form Actions */}
          <SampleFormActions
            mode={mode}
            isSubmitting={isSubmitting}
            submitProgress={submitProgress}
            onCancel={handleCancel}
          />
        </form>
      </div>
    </div>
  );
};

export default SampleForm;