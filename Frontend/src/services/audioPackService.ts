// src/services/audioPackService.ts
import API from '../api/config';
import { UploadPackDto, ApiResponse } from '../api/upload.api';
import { UpdatePackDto } from '../api/update.api'; // You'll need to create this
import { packUploadService } from './packUploadService';
import { packUpdateService } from './packUpdateService'; // Import new service
import { audioSampleService } from './audioSampleService';

/**
 * Audio Pack Service - complete pack CRUD operations
 */
export const audioPackService = {
  // CREATE - Uses pack upload service
  async uploadPack(data: UploadPackDto): Promise<ApiResponse> {
    return await packUploadService.uploadPack(data);
  },

  async uploadPackWithProgress(
    data: UploadPackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    return await packUploadService.uploadPackWithProgress(data, onProgress);
  },

  // UPDATE - Uses pack update service
  async updatePack(packId: string, data: UpdatePackDto): Promise<ApiResponse> {
    return await packUpdateService.updatePack(packId, data);
  },

  async updatePackWithProgress(
    packId: string,
    data: UpdatePackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    return await packUpdateService.updatePackWithProgress(packId, data, onProgress);
  },

  // READ operations (unchanged)
  async hasUploadedPacks(): Promise<{ hasPacks: boolean; count?: number; error?: string }> {
    try {
      const response = await API.get('/audio/packs/my-packs');
      
      if (response.status === 200) {
        const data = response.data;
        const packs = Array.isArray(data) ? data : data.packs || [];
        return {
          hasPacks: packs.length > 0,
          count: packs.length
        };
      }
      
      return { hasPacks: false, count: 0 };
    } catch (error: any) {
      console.error('Error checking user packs:', error);
      return {
        hasPacks: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getAllPacks(page: number = 0, size: number = 50): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/all', {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching all packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getMyUploadedPacks(): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/my-packs');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching user packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getPackById(packId: string): Promise<ApiResponse> {
    try {
      const response = await API.get(`/audio/packs/${packId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching pack:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getPackWithSamples(packId: string): Promise<ApiResponse> {
    try {
      const response = await API.get(`/audio/packs/${packId}/detail`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching pack with samples:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getPacksByGenre(genre: string): Promise<ApiResponse> {
    try {
      const response = await API.get(`/audio/packs/genre/${genre}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching packs by genre:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // DELETE (unchanged)
  async deletePack(packId: string): Promise<ApiResponse> {
    try {
      await API.delete(`/audio/packs/${packId}`);
      return {
        success: true,
        message: 'Pack deleted successfully',
      };
    } catch (error: any) {
      console.error('Pack delete error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Delete failed',
      };
    }
  },

  // SEARCH (unchanged)
  async searchPacks(searchRequest: any): Promise<ApiResponse> {
    try {
      const response = await API.post('/audio/packs/search', searchRequest);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error searching packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // PACK MANAGEMENT - NEW METHODS using audioSampleService
  async addSampleToPack(packId: string, sampleData: any): Promise<ApiResponse> {
    try {
      // Use audioSampleService to upload the sample first
      const uploadResult = await audioSampleService.uploadSample({
        ...sampleData,
        // Ensure the sample is associated with the pack
        packId: packId
      });

      if (!uploadResult.success) {
        return uploadResult;
      }

      return {
        success: true,
        data: uploadResult.data,
        message: 'Sample added to pack successfully',
      };
    } catch (error: any) {
      console.error('Error adding sample to pack:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async removeSampleFromPack(packId: string, sampleId: string): Promise<ApiResponse> {
    try {
      // Use audioSampleService to update the sample and remove pack association
      const updateResult = await audioSampleService.updateSampleMetadata(sampleId, {
        packId: null // Remove pack association
      });

      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        message: 'Sample removed from pack successfully',
      };
    } catch (error: any) {
      console.error('Error removing sample from pack:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async updateSamplePriceInPack(sampleId: string, price: number): Promise<ApiResponse> {
    try {
      // Use audioSampleService to update the sample price
      return await audioSampleService.updateSampleMetadata(sampleId, {
        price: price.toString()
      });
    } catch (error: any) {
      console.error('Error updating sample price:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // PACK ACTIONS
  async incrementDownloadCount(packId: string): Promise<ApiResponse> {
    try {
      await API.post(`/audio/packs/${packId}/download`);
      return {
        success: true,
        message: 'Download recorded successfully',
      };
    } catch (error: any) {
      console.error('Error recording download:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async ratePack(packId: string, rating: number): Promise<ApiResponse> {
    try {
      if (rating < 1.0 || rating > 5.0) {
        return {
          success: false,
          error: 'Rating must be between 1.0 and 5.0'
        };
      }

      await API.post(`/audio/packs/${packId}/rate`, null, {
        params: { rating }
      });
      
      return {
        success: true,
        message: 'Pack rated successfully',
      };
    } catch (error: any) {
      console.error('Error rating pack:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // STATISTICS
  async getProducerStats(authorId?: string): Promise<ApiResponse> {
    try {
      const endpoint = authorId 
        ? `/audio/packs/producer/${authorId}/stats`
        : '/audio/packs/producer/me/stats';
      
      const response = await API.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching producer stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // FEATURED PACKS
  async getTopRatedPacks(): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/top-rated');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching top rated packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getMostDownloadedPacks(): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/most-downloaded');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching most downloaded packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getLatestPacks(): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/latest');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching latest packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  async getFeaturedPacks(page: number = 0, size: number = 20): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/packs/featured', {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching featured packs:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Validation methods (re-export from services)
  validateCoverImage: packUploadService.validateCoverImage,
  validatePackData: packUploadService.validatePackData,
  validatePackStructure: packUploadService.validatePackStructure,
  generatePackSummary: packUploadService.generatePackSummary,
  calculatePackSize: packUploadService.calculatePackSize,
  // Add update-specific validation methods
  validateUpdateData: packUpdateService.validateUpdateData,
  hasSampleChanges: packUpdateService.hasSampleChanges,
  generateUpdateSummary: packUpdateService.generateUpdateSummary
};