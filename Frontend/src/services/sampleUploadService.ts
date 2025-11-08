// src/services/sampleUploadService.ts
import { uploadApi, UploadSampleDto, ApiResponse } from '../api/upload.api';

/**
 * Sample Upload Service - handles ONLY individual sample upload logic
 */
export const sampleUploadService = {
  /**
   * Upload a single sample
   */
  async uploadSample(data: UploadSampleDto): Promise<ApiResponse> {
    try {
      // Validate sample data first
      const validation = sampleUploadService.validateSampleData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const response = await uploadApi.uploadSample(data);
      const result = response.data;

      return {
        success: true,
        data: result,
        message: 'Sample uploaded successfully',
      };
    } catch (error: any) {
      console.error('Sample upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed',
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
      // Validate sample data first
      const validation = sampleUploadService.validateSampleData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const response = await uploadApi.uploadSampleWithProgress(data, onProgress);
      const result = response.data;

      return {
        success: true,
        data: result,
        message: 'Sample uploaded successfully',
      };
    } catch (error: any) {
      console.error('Sample upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed',
      };
    }
  },

  /**
   * Validate sample file
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
   * Validate sample data before upload
   */
  validateSampleData(data: UploadSampleDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Sample name is required');
    }

    if (!data.artist.trim()) {
      errors.push('Artist name is required');
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!data.sampleType) {
      errors.push('Sample type is required');
    }

    if (!data.instrumentGroup) {
      errors.push('Instrument group is required');
    }

    if (!data.file) {
      errors.push('Audio file is required');
    } else {
      const fileValidation = sampleUploadService.validateSampleFile(data.file);
      if (!fileValidation.valid) {
        errors.push(fileValidation.error!);
      }
    }

    if (data.bpm && (data.bpm < 0 || data.bpm > 300)) {
      errors.push('BPM must be between 0 and 300');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Extract sample name from filename
   */
  extractSampleName(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
  },

  /**
   * Generate sample metadata for display
   */
  generateSampleMetadata(file: File): { name: string; size: string; type: string } {
    return {
      name: sampleUploadService.extractSampleName(file.name),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || 'Unknown'
    };
  }
};