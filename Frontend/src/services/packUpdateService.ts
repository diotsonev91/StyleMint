// src/services/packUpdateService.ts
import { UpdatePackDto, ApiResponse, updateApi } from '../api/update.api';

export const packUpdateService = {
  async updatePack(packId: string, data: UpdatePackDto): Promise<ApiResponse> {
    try {
      console.log('🚀 packUpdateService.updatePack CALLED', {
        packId,
        samplesToRemove: data.samplesToRemove,
        samplesToRemoveLength: data.samplesToRemove?.length || 0
      });

      // Validate update data first
      const validation = packUpdateService.validateUpdateData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Call the updated API that now uses FormData
      const response = await updateApi.updatePack(packId, data);
      
      console.log('✅ packUpdateService - Update successful');
      
      return {
        success: true,
        data: response.data,
        message: 'Pack updated successfully',
      };
    } catch (error: any) {
      console.error('❌ packUpdateService - Update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Update failed',
      };
    }
  },

  async updatePackWithProgress(
    packId: string,
    data: UpdatePackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    try {
      console.log('🚀 packUpdateService.updatePackWithProgress CALLED', {
        packId,
        samplesToRemove: data.samplesToRemove,
        samplesToAdd: data.samplesToAdd,
        
      });

      const validation = packUpdateService.validateUpdateData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const response = await updateApi.updatePackWithProgress(packId, data, onProgress);
      console.log(response)
      console.log('✅ packUpdateService - Update with progress successful');
      
      return {
        success: true,
        data: response.data,
        message: 'Pack updated successfully',
      };
    } catch (error: any) {
      console.error('❌ packUpdateService - Update with progress error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Update failed',
      };
    }
  },

  // Keep only the validation methods, remove buildUpdateFormData
  validateUpdateData(data: UpdatePackDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) errors.push('Pack title is required');
    if (!data.artist?.trim()) errors.push('Artist name is required');
    if (!data.price || parseFloat(data.price) <= 0) errors.push('Valid price is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.genres || data.genres.length === 0) errors.push('At least one genre must be selected');

    return { valid: errors.length === 0, errors };
  },

  validateCoverImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) return { valid: false, error: 'Image size exceeds 5MB limit' };
    if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid image format' };

    return { valid: true };
  },

  hasSampleChanges(data: UpdatePackDto): boolean {
    return !!(
      (data.samplesToAdd && data.samplesToAdd.length > 0) ||
      (data.samplesToRemove && data.samplesToRemove.length > 0) ||
      (data.existingSamplesToAdd && data.existingSamplesToAdd.length > 0)
    );
  },

  generateUpdateSummary(data: UpdatePackDto) {
    return {
      samplesToAdd: data.samplesToAdd?.length || 0,
      samplesToRemove: data.samplesToRemove?.length || 0,
      existingSamplesToAdd: data.existingSamplesToAdd?.length || 0,
      hasCoverImageChange: !!(data.coverImage || data.removeCoverImage)
    };
  }
};