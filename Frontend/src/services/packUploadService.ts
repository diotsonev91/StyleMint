// src/services/packUploadService.ts
import { uploadApi, UploadPackDto, ApiResponse } from '../api/upload.api';
import { sampleUploadService } from './sampleUploadService';
/**
 * Pack Upload Service - handles ONLY sample pack upload logic
 */
export const packUploadService = {
  /**
   * Upload a sample pack
   */
  async uploadPack(data: UploadPackDto): Promise<ApiResponse> {
    try {
      // Validate pack data first
      const validation = packUploadService.validatePackData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const response = await uploadApi.uploadPack(data);
      const result = response.data;

      return {
        success: true,
        data: result,
        message: 'Sample pack uploaded successfully',
      };
    } catch (error: any) {
      console.error('Pack upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Pack upload failed',
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
      // Validate pack data first
      const validation = packUploadService.validatePackData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const response = await uploadApi.uploadPackWithProgress(data, onProgress);
      const result = response.data;

      return {
        success: true,
        data: result,
        message: 'Sample pack uploaded successfully',
      };
    } catch (error: any) {
      console.error('Pack upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Pack upload failed',
      };
    }
  },

  /**
   * Validate cover image
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
    } else {
      const imageValidation = packUploadService.validateCoverImage(data.coverImage);
      if (!imageValidation.valid) {
        errors.push(`Cover image: ${imageValidation.error}`);
      }
    }

    // Validate each sample in the pack
    data.samples.forEach((sample, index) => {
      if (!sample.name.trim()) {
        errors.push(`Sample ${index + 1}: Name is required`);
      }

      // Use sample upload service to validate individual sample files
      const fileValidation = sampleUploadService.validateSampleFile(sample.file);
      if (!fileValidation.valid) {
        errors.push(`Sample ${index + 1}: ${fileValidation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Calculate total pack size
   */
  calculatePackSize(samples: File[], coverImage: File): string {
    const totalSize = samples.reduce((total, file) => total + file.size, 0) + coverImage.size;
    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
  },

  /**
   * Generate pack summary
   */
  generatePackSummary(data: UploadPackDto): {
    sampleCount: number;
    totalSize: string;
    genres: string[];
  } {
    return {
      sampleCount: data.samples.length,
      totalSize: packUploadService.calculatePackSize(
        data.samples.map(s => s.file), 
        data.coverImage
      ),
      genres: data.genres
    };
  },

  /**
   * Validate pack structure
   */
  validatePackStructure(samples: any[]): { valid: boolean; error?: string } {
    if (samples.length === 0) {
      return {
        valid: false,
        error: 'Pack must contain at least one sample'
      };
    }

    if (samples.length > 100) {
      return {
        valid: false,
        error: 'Pack cannot contain more than 100 samples'
      };
    }

    return { valid: true };
  }
};