// src/components/UploadPackForm.tsx
import React, { useState } from 'react';
import './UploadPackForm.css';

interface Sample {
  id: string;
  file: File;
  name: string;
  duration?: string;
  bpm?: number;
  key?: string;
  genre?: string;
}

const UploadPackForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Pack Information
  const [packTitle, setPackTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Samples
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const availableKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];

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
    }
  };

  // Genre handler
  const toggleGenre = (genre: string) => {
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

  // Sample handlers
  const handleSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newSamples: Sample[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name.replace(/\.[^/.]+$/, ""),
        genre: selectedGenres[0] || ''
      }));
      setSamples([...samples, ...newSamples]);
    }
  };

  const updateSample = (id: string, field: keyof Sample, value: any) => {
    setSamples(samples.map(sample => 
      sample.id === id ? { ...sample, [field]: value } : sample
    ));
  };

  const removeSample = (id: string) => {
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
    
    if (!isStep2Valid()) {
      alert('Please add at least 1 sample');
      return;
    }

    setIsUploading(true);

    // Create FormData
    const formData = new FormData();
    
    // Pack info
    formData.append('title', packTitle);
    formData.append('artist', artist);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('genres', JSON.stringify(selectedGenres));
    formData.append('tags', JSON.stringify(tags));
    
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    // Samples
    samples.forEach((sample, index) => {
      formData.append(`samples[${index}].file`, sample.file);
      formData.append(`samples[${index}].name`, sample.name);
      if (sample.bpm) formData.append(`samples[${index}].bpm`, sample.bpm.toString());
      if (sample.key) formData.append(`samples[${index}].key`, sample.key);
      if (sample.genre) formData.append(`samples[${index}].genre`, sample.genre);
    });

    try {
      // Replace with your API endpoint
      const response = await fetch('http://localhost:8080/api/packs/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Sample pack uploaded successfully!');
        // Reset form
        resetForm();
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
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
  };

  return (
    <div className="upload-pack-page">
      {/* Background */}
      <div className="upload-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="upload-container">
        {/* Header */}
        <header className="upload-header">
          <h1 className="upload-title">
            Upload <span className="gradient-text">Sample Pack</span>
          </h1>
          <p className="upload-subtitle">
            Share your sounds with the community
          </p>
        </header>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">
              {step > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : '1'}
            </div>
            <span className="step-label">Pack Info</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Add Samples</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="upload-form">
          {/* Step 1: Pack Information */}
          {step === 1 && (
            <div className="form-step" style={{ animation: 'slideIn 0.5s ease-out' }}>
              {/* Cover Image */}
              <div className="form-section">
                <label className="section-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Cover Image *
                </label>
                
                <div className="cover-upload">
                  {coverPreview ? (
                    <div className="cover-preview">
                      <img src={coverPreview} alt="Cover preview" />
                      <button 
                        type="button" 
                        className="remove-cover"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview('');
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="cover-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        hidden
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Click to upload cover image</span>
                      <small>PNG, JPG (max 5MB)</small>
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="form-row">
                <div className="form-group">
                  <label>Pack Title *</label>
                  <input
                    type="text"
                    value={packTitle}
                    onChange={(e) => setPackTitle(e.target.value)}
                    placeholder="e.g. Essential Afro House"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Artist / Label *</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Toolroom Records"
                    required
                  />
                </div>
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
                    placeholder="29.99"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your sample pack..."
                  rows={5}
                  required
                />
                <small className="char-count">{description.length} / 1000 characters</small>
              </div>

              {/* Genres */}
              <div className="form-group">
                <label>Genres * (Select at least one)</label>
                <div className="genre-grid">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {selectedGenres.includes(genre) && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {genre}
                    </button>
                  ))}
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
                    placeholder="Add tags (e.g. Percussion, Vocals)"
                  />
                  <button type="button" onClick={addTag} className="add-tag-btn">
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="tags-list">
                    {tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid()}
                >
                  Next: Add Samples
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Add Samples */}
          {step === 2 && (
            <div className="form-step" style={{ animation: 'slideIn 0.5s ease-out' }}>
              {/* Upload Samples */}
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
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Click to upload audio files</span>
                  <small>WAV, MP3, AIFF (Multiple files supported)</small>
                </label>
              </div>

              {/* Samples List */}
              {samples.length > 0 && (
                <div className="samples-list">
                  <div className="samples-header">
                    <h3>{samples.length} Sample{samples.length !== 1 ? 's' : ''} Added</h3>
                  </div>

                  {samples.map((sample, index) => (
                    <div key={sample.id} className="sample-item-edit">
                      <div className="sample-number">{index + 1}</div>
                      
                      <div className="sample-edit-grid">
                        <div className="form-group">
                          <label>Sample Name</label>
                          <input
                            type="text"
                            value={sample.name}
                            onChange={(e) => updateSample(sample.id, 'name', e.target.value)}
                            placeholder="Sample name"
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
                          />
                        </div>

                        <div className="form-group">
                          <label>Key (Optional)</label>
                          <select
                            value={sample.key || ''}
                            onChange={(e) => updateSample(sample.id, 'key', e.target.value)}
                          >
                            <option value="">Select key</option>
                            {availableKeys.map(key => (
                              <option key={key} value={key}>{key}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Genre</label>
                          <select
                            value={sample.genre || ''}
                            onChange={(e) => updateSample(sample.id, 'genre', e.target.value)}
                          >
                            <option value="">Select genre</option>
                            {selectedGenres.map(genre => (
                              <option key={genre} value={genre}>{genre}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="remove-sample"
                        onClick={() => removeSample(sample.id)}
                        title="Remove sample"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep(1)}
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
                      Uploading...
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