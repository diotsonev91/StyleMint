// src/components/UploadSampleForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadService } from '../../services/audioService';
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
import './UploadSampleForm.css';

const UploadSampleForm: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Form state
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [bpm, setBpm] = useState<number | undefined>(undefined);
  const [musicalKey, setMusicalKey] = useState<MusicalKey | undefined>(undefined);
  const [musicalScale, setMusicalScale] = useState<MusicalScale | undefined>(undefined);
  const [genre, setGenre] = useState<Genre | undefined>(undefined);
  const [sampleType, setSampleType] = useState<SampleType | undefined>(undefined);
  const [instrumentGroup, setInstrumentGroup] = useState<InstrumentGroup | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Enum options for dropdowns
  const musicalKeyOptions = Object.values(MusicalKey);
  const musicalScaleOptions = Object.values(MusicalScale);
  const sampleTypeOptions = Object.values(SampleType);
  const genreOptions = Object.values(Genre);
  const instrumentGroupOptions = Object.values(InstrumentGroup);

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          sessionStorage.setItem('redirectAfterLogin', '/upload');
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
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSampleFile(file);
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setSampleName(nameWithoutExtension);
      setUploadError(null);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isAuthenticated) {
      setUploadError('You must be logged in to upload samples');
      navigate('/login');
      return;
    }

    if (!sampleFile) {
      setUploadError('Please select an audio file');
      return;
    }

    if (!sampleName || !artist || !price || !sampleType || !instrumentGroup) {
      setUploadError('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      const response = await uploadService.uploadSampleWithProgress(
        {
          file: sampleFile,
          name: sampleName,
          artist: artist,
          price: price,
          bpm: bpm,
          musicalKey: musicalKey,
          musicalScale: musicalScale,
          genre: genre,
          sampleType: sampleType,
          instrumentGroup: instrumentGroup,
          tags: tags
        },
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      if (response.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        if (response.error?.includes('401') || response.error?.includes('unauthorized')) {
          setUploadError('Session expired. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setUploadError(response.error || 'Upload failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error?.response?.status === 401) {
        setUploadError('Session expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setUploadError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSampleFile(null);
    setSampleName('');
    setArtist('');
    setPrice('');
    setBpm(undefined);
    setMusicalKey(undefined);
    setMusicalScale(undefined);
    setGenre(undefined);
    setSampleType(undefined);
    setInstrumentGroup(undefined);
    setTags([]);
    setTagInput('');
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="upload-sample-page">
        <div className="upload-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="upload-container-single">
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
      <div className="upload-sample-page">
        <div className="upload-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="upload-container-single">
          <div className="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Authentication Required</strong>
              <p>You must be logged in to upload samples. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-sample-page">
      <div className="upload-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="upload-container-single">
        <header className="upload-header">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="upload-title">
            Upload <span className="gradient-text">Sample</span>
          </h1>
          <p className="upload-subtitle">
            Share your individual sound with producers worldwide
          </p>
        </header>

        {uploadSuccess && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sample uploaded successfully!</span>
          </div>
        )}

        {uploadError && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form-single">
          {/* Audio File Upload */}
          <div className="form-section-highlight">
            <label className="section-label-big">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Select Audio File *
            </label>

            {sampleFile ? (
              <div className="file-selected">
                <div className="file-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <div className="file-details">
                    <span className="file-name">{sampleFile.name}</span>
                    <span className="file-size">
                      {(sampleFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="change-file-btn"
                  onClick={() => setSampleFile(null)}
                  disabled={isUploading}
                >
                  Change File
                </button>
              </div>
            ) : (
              <label className="audio-upload-area">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  hidden
                  required
                  disabled={isUploading}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Click to upload audio file</span>
                <small>WAV, MP3, AIFF, FLAC (max 50MB)</small>
              </label>
            )}
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}% uploaded</span>
            </div>
          )}

          {/* Sample Information */}
          <div className="form-grid">
            <div className="form-group">
              <label>Sample Name *</label>
              <input
                type="text"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
                placeholder="e.g. Deep Bass One Shot"
                required
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label>Artist Name *</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Your artist name"
                required
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label>Price (USD) *</label>
              <div className="price-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="4.99"
                  required
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>BPM (Optional)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={bpm || ''}
                onChange={(e) => setBpm(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="120"
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label>Musical Key (Optional)</label>
              <select 
                value={musicalKey || ''} 
                onChange={(e) => setMusicalKey(e.target.value as MusicalKey)}
                disabled={isUploading}
              >
                <option value="">Select key</option>
                {musicalKeyOptions.map(key => (
                  <option key={key} value={key}>
                    {getMusicalKeyDisplayName(key)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Musical Scale (Optional)</label>
              <select 
                value={musicalScale || ''} 
                onChange={(e) => setMusicalScale(e.target.value as MusicalScale)}
                disabled={isUploading}
              >
                <option value="">Select scale</option>
                {musicalScaleOptions.map(scale => (
                  <option key={scale} value={scale}>
                    {getMusicalScaleDisplayName(scale)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Genre (Optional)</label>
              <select 
                value={genre || ''} 
                onChange={(e) => setGenre(e.target.value as Genre)}
                disabled={isUploading}
              >
                <option value="">Select genre</option>
                {genreOptions.map(g => (
                  <option key={g} value={g}>{g.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sample Type *</label>
              <select 
                value={sampleType || ''} 
                onChange={(e) => setSampleType(e.target.value as SampleType)}
                required
                disabled={isUploading}
              >
                <option value="">Select type</option>
                {sampleTypeOptions.map(type => (
                  <option key={type} value={type}>
                    {getSampleTypeDisplayName(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Instrument Group *</label>
              <select 
                value={instrumentGroup || ''} 
                onChange={(e) => setInstrumentGroup(e.target.value as InstrumentGroup)}
                required
                disabled={isUploading}
              >
                <option value="">Select group</option>
                {instrumentGroupOptions.map(group => (
                  <option key={group} value={group}>
                    {getInstrumentGroupDisplayName(group)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Optional)</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g. Bass, Loop, One-Shot)"
                disabled={isUploading}
              />
              <button 
                type="button" 
                onClick={addTag} 
                className="add-tag-btn"
                disabled={isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      disabled={isUploading}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit-single"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="spinner"></div>
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Upload Sample
              </>
            )}
          </button>

          <div className="info-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Upload Guidelines:</strong>
              <ul>
                <li>Audio quality: Minimum 16-bit, 44.1kHz</li>
                <li>File formats: WAV preferred, MP3 acceptable</li>
                <li>Maximum file size: 50MB</li>
                <li>Ensure you own the rights to the sample</li>
                <li>Required fields: File, Name, Artist, Price, Sample Type, Instrument Group</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSampleForm;