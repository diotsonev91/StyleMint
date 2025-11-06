// src/components/UploadPackForm.tsx - WITH AUTH PROTECTION & AUDIO PREVIEW
import React, { useState, useRef, useEffect } from 'react';
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
import './UploadPackForm.css';

interface Sample {
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

const UploadPackForm: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [step, setStep] = useState<1 | 2>(1);
  
  // Pack Information
  const [packTitle, setPackTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Samples
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Audio playback state
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          sessionStorage.setItem('redirectAfterLogin', '/upload-pack');
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      samples.forEach(sample => {
        if (sample.audioUrl) {
          URL.revokeObjectURL(sample.audioUrl);
        }
      });
    };
  }, [samples]);

  // Cover image handler
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadError(null);
    }
  };

  // Genre handler
  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Tag handler
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Audio playback handlers
  const handlePlaySample = (sample: Sample) => {
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
  const handleSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newSamples: Sample[] = Array.from(files).map(file => {
        const audioUrl = URL.createObjectURL(file);
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: artist, // Use the pack artist as default
          genre: selectedGenres[0], // Use first selected genre as default
          sampleType: SampleType.ONESHOT, // Default to one shot
          instrumentGroup: InstrumentGroup.DRUMS, // Default to drums
          audioUrl,
        };
      });
      
      setSamples([...samples, ...newSamples]);
      setUploadError(null);
    }
  };

  const updateSample = (id: string, field: keyof Sample, value: any) => {
    setSamples(samples.map(sample => 
      sample.id === id ? { ...sample, [field]: value } : sample
    ));
  };

  const removeSample = (id: string) => {
    if (playingSampleId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingSampleId(null);
    }

    const sample = samples.find(s => s.id === id);
    if (sample?.audioUrl) {
      URL.revokeObjectURL(sample.audioUrl);
    }

    setSamples(samples.filter(sample => sample.id !== id));
  };

  // Validation
  const isStep1Valid = () => {
    return packTitle.trim() !== '' && 
           artist.trim() !== '' && 
           price !== '' && 
           coverImage !== null && 
           description.trim() !== '' &&
           selectedGenres.length > 0;
  };

  const isStep2Valid = () => {
    return samples.length >= 1;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setUploadError('You must be logged in to upload sample packs');
      navigate('/login');
      return;
    }
    
    if (!isStep2Valid()) {
      setUploadError('Please add at least 1 sample');
      return;
    }

    if (!coverImage) {
      setUploadError('Cover image is required');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Prepare samples data with correct types
      const samplesData = samples.map(sample => ({
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

      const response = await uploadService.uploadPackWithProgress(
        {
          title: packTitle,
          artist: artist,
          price: price,
          description: description,
          genres: selectedGenres, // Now using Genre[] instead of string[]
          tags: tags,
          coverImage: coverImage,
          samples: samplesData, // Now matches the correct type
        },
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      if (response.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          resetForm();
        }, 3000);
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSampleId(null);

    samples.forEach(sample => {
      if (sample.audioUrl) {
        URL.revokeObjectURL(sample.audioUrl);
      }
    });

    setStep(1);
    setPackTitle('');
    setArtist('');
    setPrice('');
    setCoverImage(null);
    setCoverPreview('');
    setDescription('');
    setSelectedGenres([]);
    setTags([]);
    setSamples([]);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="upload-pack-page">
        <div className="upload-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="upload-container">
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
      <div className="upload-pack-page">
        <div className="upload-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="upload-container">
          <div className="alert alert-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Authentication Required</strong>
              <p>You must be logged in to upload sample packs. Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-pack-page">
      <div className="upload-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="upload-container">
        <header className="upload-header">
          <h1 className="upload-title">
            Upload <span className="gradient-text">Sample Pack</span>
          </h1>
          <p className="upload-subtitle">
            Share your sounds with the community
          </p>
        </header>

        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '1'
              )}
            </div>
            <span>Pack Info</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>Add Samples</span>
          </div>
        </div>

        {uploadError && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sample pack uploaded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Pack Title *</label>
                <input
                  type="text"
                  value={packTitle}
                  onChange={(e) => setPackTitle(e.target.value)}
                  placeholder="Essential Afro House"
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
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="29.99"
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label>Cover Image *</label>
                <div className="cover-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    hidden
                    id="cover-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="cover-upload" className="cover-upload-label">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="cover-preview" />
                    ) : (
                      <div className="cover-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Click to upload cover image</span>
                        <small>JPG, PNG, or WebP</small>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your sample pack..."
                  rows={4}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label>Genres * (Select at least one)</label>
                <div className="genre-grid">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                      onClick={() => toggleGenre(genre)}
                      disabled={isUploading}
                    >
                      {selectedGenres.includes(genre) && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {genre.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tags (Optional)</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags (e.g. Percussion, Vocals)"
                    disabled={isUploading}
                  />
                  <button 
                    type="button" 
                    onClick={addTag} 
                    className="add-tag-btn"
                    disabled={isUploading}
                  >
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

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid() || isUploading}
                >
                  Next: Add Samples
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step" style={{ animation: 'slideIn 0.5s ease-out' }}>
              <div className="form-section">
                <label className="section-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Audio Samples * (Minimum 1)
                </label>

                <label className="samples-upload-area">
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleSampleUpload}
                    hidden
                    disabled={isUploading}
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Click to upload audio files</span>
                  <small>WAV, MP3, AIFF (Multiple files supported)</small>
                </label>
              </div>

              {samples.length > 0 && (
                <div className="samples-list">
                  <div className="samples-header">
                    <h3>{samples.length} Sample{samples.length !== 1 ? 's' : ''} Added</h3>
                  </div>

                  {samples.map((sample, index) => (
                    <div key={sample.id} className="sample-item-edit">
                      <div className="sample-number">{index + 1}</div>
                      
                      <button
                        type="button"
                        className={`sample-play-button ${playingSampleId === sample.id ? 'playing' : ''}`}
                        onClick={() => handlePlaySample(sample)}
                        title={playingSampleId === sample.id ? 'Pause' : 'Play preview'}
                        disabled={isUploading}
                      >
                        {playingSampleId === sample.id ? (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <div className="sample-edit-grid">
                        <div className="form-group">
                          <label>Sample Name *</label>
                          <input
                            type="text"
                            value={sample.name}
                            onChange={(e) => updateSample(sample.id, 'name', e.target.value)}
                            placeholder="Sample name"
                            required
                            disabled={isUploading}
                          />
                        </div>

                        <div className="form-group">
                          <label>Artist *</label>
                          <input
                            type="text"
                            value={sample.artist}
                            onChange={(e) => updateSample(sample.id, 'artist', e.target.value)}
                            placeholder="Artist name"
                            required
                            disabled={isUploading}
                          />
                        </div>

                        <div className="form-group">
                          <label>BPM (Optional)</label>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={sample.bpm || ''}
                            onChange={(e) => updateSample(sample.id, 'bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="120"
                            disabled={isUploading}
                          />
                        </div>

                        <div className="form-group">
                          <label>Musical Key (Optional)</label>
                          <select
                            value={sample.musicalKey || ''}
                            onChange={(e) => updateSample(sample.id, 'musicalKey', e.target.value as MusicalKey)}
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
                            value={sample.musicalScale || ''}
                            onChange={(e) => updateSample(sample.id, 'musicalScale', e.target.value as MusicalScale)}
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
                            value={sample.genre || ''}
                            onChange={(e) => updateSample(sample.id, 'genre', e.target.value as Genre)}
                            disabled={isUploading}
                          >
                            <option value="">Select genre</option>
                            {genreOptions.map(genre => (
                              <option key={genre} value={genre}>
                                {genre.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Sample Type *</label>
                          <select
                            value={sample.sampleType}
                            onChange={(e) => updateSample(sample.id, 'sampleType', e.target.value as SampleType)}
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
                            value={sample.instrumentGroup}
                            onChange={(e) => updateSample(sample.id, 'instrumentGroup', e.target.value as InstrumentGroup)}
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

                      <button
                        type="button"
                        className="remove-sample"
                        onClick={() => removeSample(sample.id)}
                        title="Remove sample"
                        disabled={isUploading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep(1)}
                  disabled={isUploading}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Back
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!isStep2Valid() || isUploading}
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
                      Upload Sample Pack
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadPackForm;