// src/services/upload.service.ts

import { uploadApi, UploadSampleDto, UploadPackDto, ApiResponse } from '../api/upload.api';

/**
 * Upload Service - business logic layer for upload operations
 */
export const uploadService = {
  /**
   * Upload a single sample
   */
  async uploadSample(data: UploadSampleDto): Promise<ApiResponse> {
    try {
      const response = await uploadApi.uploadSample(data);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || 'Upload failed',
        };
      }

      return {
        success: true,
        data: result,
        message: 'Sample uploaded successfully',
      };
    } catch (error) {
      console.error('Sample upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Upload a sample with progress tracking
   */
  async uploadSampleWithProgress(
    data: UploadSampleDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    try {
      const response = await uploadApi.uploadSampleWithProgress(data, onProgress);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || 'Upload failed',
        };
      }

      return {
        success: true,
        data: result,
        message: 'Sample uploaded successfully',
      };
    } catch (error) {
      console.error('Sample upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Upload a sample pack
   */
  async uploadPack(data: UploadPackDto): Promise<ApiResponse> {
    try {
      const response = await uploadApi.uploadPack(data);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || 'Pack upload failed',
        };
      }

      return {
        success: true,
        data: result,
        message: 'Sample pack uploaded successfully',
      };
    } catch (error) {
      console.error('Pack upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Upload a pack with progress tracking
   */
  async uploadPackWithProgress(
    data: UploadPackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    try {
      const response = await uploadApi.uploadPackWithProgress(data, onProgress);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || 'Pack upload failed',
        };
      }

      return {
        success: true,
        data: result,
        message: 'Sample pack uploaded successfully',
      };
    } catch (error) {
      console.error('Pack upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Validate sample file before upload
   */
  validateSampleFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/flac', 'audio/x-wav', 'audio/x-aiff'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 50MB limit',
      };
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|aiff|flac)$/i)) {
      return {
        valid: false,
        error: 'Invalid file format. Please upload WAV, MP3, AIFF, or FLAC files',
      };
    }

    return { valid: true };
  },

  /**
   * Validate cover image before upload
   */
  validateCoverImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size exceeds 5MB limit',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Please upload JPG, PNG, or WebP files',
      };
    }

    return { valid: true };
  },

  /**
   * Validate sample pack data before upload
   */
  validatePackData(data: UploadPackDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title.trim()) {
      errors.push('Pack title is required');
    }

    if (!data.artist.trim()) {
      errors.push('Artist name is required');
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!data.description.trim()) {
      errors.push('Description is required');
    }

    if (data.genres.length === 0) {
      errors.push('At least one genre must be selected');
    }

    if (data.samples.length === 0) {
      errors.push('At least one sample is required');
    }

    if (!data.coverImage) {
      errors.push('Cover image is required');
    }

    // Validate each sample
    data.samples.forEach((sample, index) => {
      if (!sample.name.trim()) {
        errors.push(`Sample ${index + 1}: Name is required`);
      }

      const fileValidation = uploadService.validateSampleFile(sample.file);
      if (!fileValidation.valid) {
        errors.push(`Sample ${index + 1}: ${fileValidation.error}`);
      }
    });

    // Validate cover image
    if (data.coverImage) {
      const imageValidation = uploadService.validateCoverImage(data.coverImage);
      if (!imageValidation.valid) {
        errors.push(`Cover image: ${imageValidation.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate single sample data before upload
   */
  validateSampleData(data: UploadSampleDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Sample name is required');
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!data.genre.trim()) {
      errors.push('Genre is required');
    }

    if (!data.file) {
      errors.push('Audio file is required');
    } else {
      const fileValidation = uploadService.validateSampleFile(data.file);
      if (!fileValidation.valid) {
        errors.push(fileValidation.error!);
      }
    }

    if (data.bpm && (parseInt(data.bpm) < 0 || parseInt(data.bpm) > 300)) {
      errors.push('BPM must be between 0 and 300');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};