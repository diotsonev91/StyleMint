// src/components/PackForm/PackForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackForm } from './hooks/usePackForm';
import { usePackFormAuth } from './hooks/usePackFormAuth';
import { PackFormHeader } from './PackForm/PackFormHeader';
import { PackFormProgress } from './PackForm/PackFormProgress';
import { PackInfoStep } from './PackForm/PackInfoStep';
import { SamplesStep } from './PackForm/SamplesStep';
import { SubmissionHandler } from './PackForm/SubmissionHandler';
import './PackForm.css';
import { PackFormData } from './PackForm/types';

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
  onCancel 
}) => {
  const navigate = useNavigate();
  
  // Authentication hook
  const { isAuthenticated, isCheckingAuth } = usePackFormAuth(mode, packId);
  
  // Form state hook
  const {
    formData,
    step,
    isSubmitting,
    submitProgress,
    submitError,
    submitSuccess,
    playingSampleId,
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
  } = usePackForm(mode, initialData, packId);

  // Submission handler
  const submissionHandler = new SubmissionHandler(
    mode,
    packId,
    formData,
    setIsSubmitting,
    setSubmitProgress,
    setSubmitError,
    setSubmitSuccess,
    navigate,
    resetForm
  );

// Add this useEffect to debug the current state
    useEffect(() => {
        console.log('🔍 DIAGNOSTIC - Current form samples:', formData.samples.map(s => ({
            id: s.id,
            name: s.name,
            isFromLibrary: s.isFromLibrary,
            isAlreadyInPack: s.isAlreadyInPack,
            existingSampleId: s.existingSampleId,
            hasFile: !!s.file,
            fileIsNull: s.file === null,
            fileIsUndefined: s.file === undefined,
            fileConstructor: s.file?.constructor?.name,
            fileSize: s.file?.size,
            fileName: s.file?.name,
        })));
    }, [formData.samples]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("HANDL:E SUBMIT")
    await submissionHandler.handleSubmit();
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

        <PackFormProgress step={step} mode={mode} />

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
              mode={mode}
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


