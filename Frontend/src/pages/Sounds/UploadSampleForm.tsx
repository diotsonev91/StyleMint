// src/components/UploadSampleForm.tsx
import React, { useState } from 'react';
import { uploadService } from '../../services/audioService';
import './UploadSampleForm.css';

const UploadSampleForm: React.FC = () => {
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [price, setPrice] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const availableGenres = [
    "Afro House",
    "Deep House",
    "Tech House",
    "Techno",
    "House",
    "Progressive House",
    "Melodic Techno",
    "Minimal"
  ];

  const availableKeys = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
    "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSampleFile(file);
      // Auto-fill sample name from filename
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

    if (!sampleFile) {
      setUploadError('Please select an audio file');
      return;
    }

    if (!genre) {
      setUploadError('Please select a genre');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Use upload service with progress tracking
      const response = await uploadService.uploadSampleWithProgress(
        {
          file: sampleFile,
          name: sampleName,
          price: price,
          bpm: bpm,
          key: key,
          genre: genre,
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
        setUploadError(response.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSampleFile(null);
    setSampleName('');
    setPrice('');
    setBpm('');
    setKey('');
    setGenre('');
    setTags([]);
    setTagInput('');
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="upload-sample-page">
      {/* Background */}
      <div className="upload-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="upload-container-single">
        {/* Header */}
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

        {/* Success Message */}
        {uploadSuccess && (
          <div className="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sample uploaded successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="upload-form-single">
          {/* Audio File Upload */}
          <div className="form-section-highlight">
            <label className="section-label-big">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Select Audio File
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

          {/* Upload Progress */}
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
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label>Key (Optional)</label>
              <select 
                value={key} 
                onChange={(e) => setKey(e.target.value)}
                disabled={isUploading}
              >
                <option value="">Select key</option>
                {availableKeys.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Genre *</label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                required
                disabled={isUploading}
              >
                <option value="">Select genre</option>
                {availableGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
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

          {/* Submit Button */}
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

          {/* Info Box */}
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
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSampleForm;