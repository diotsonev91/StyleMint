// src/services/audioPackService.ts
import API from '../api/config';
import { UploadPackDto, ApiResponse } from '../api/upload.api';
import { packUploadService } from './packUploadService';

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

  // READ
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

  // UPDATE - Uses pack upload validation
  async updatePack(
    packId: string, 
    data: UploadPackDto
  ): Promise<ApiResponse> {
    try {
      // Use pack upload service validation
      const validation = packUploadService.validatePackData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const formData = new FormData();
      
      // Append pack metadata
      formData.append('title', data.title);
      formData.append('artist', data.artist);
      formData.append('price', data.price);
      formData.append('description', data.description);
      
      // Append genres
      data.genres.forEach(genre => {
        formData.append('genres', genre);
      });
      
      // Append cover image if provided
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      
      // Append samples
      data.samples.forEach((sample, index) => {
        formData.append(`samples[${index}].file`, sample.file);
        formData.append(`samples[${index}].name`, sample.name);
        
        if (sample.bpm) formData.append(`samples[${index}].bpm`, sample.bpm.toString());
        if (sample.musicalKey) formData.append(`samples[${index}].musicalKey`, sample.musicalKey);
        if (sample.musicalScale) formData.append(`samples[${index}].musicalScale`, sample.musicalScale);
        if (sample.genre) formData.append(`samples[${index}].genre`, sample.genre);
        if (sample.sampleType) formData.append(`samples[${index}].sampleType`, sample.sampleType);
        if (sample.instrumentGroup) formData.append(`samples[${index}].instrumentGroup`, sample.instrumentGroup);
        
      });

      const response = await API.put(`/audio/packs/${packId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Pack updated successfully',
      };
    } catch (error: any) {
      console.error('Pack update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Update failed',
      };
    }
  },

  // UPDATE with progress tracking
  async updatePackWithProgress(
    packId: string,
    data: UploadPackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    try {
      const validation = packUploadService.validatePackData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('artist', data.artist);
      formData.append('price', data.price);
      formData.append('description', data.description);
      
      data.genres.forEach(genre => {
        formData.append('genres', genre);
      });
      
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      
      data.samples.forEach((sample, index) => {
        formData.append(`samples[${index}].file`, sample.file);
        formData.append(`samples[${index}].name`, sample.name);
        
        if (sample.bpm) formData.append(`samples[${index}].bpm`, sample.bpm.toString());
        if (sample.musicalKey) formData.append(`samples[${index}].musicalKey`, sample.musicalKey);
        if (sample.musicalScale) formData.append(`samples[${index}].musicalScale`, sample.musicalScale);
        if (sample.genre) formData.append(`samples[${index}].genre`, sample.genre);
        if (sample.sampleType) formData.append(`samples[${index}].sampleType`, sample.sampleType);
        if (sample.instrumentGroup) formData.append(`samples[${index}].instrumentGroup`, sample.instrumentGroup);
        
      }); 

      const response = await API.put(`/audio/packs/${packId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Pack updated successfully',
      };
    } catch (error: any) {
      console.error('Pack update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Update failed',
      };
    }
  },

  // DELETE
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

  // SEARCH
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

  // PACK MANAGEMENT
  async addSampleToPack(packId: string, sampleData: any): Promise<ApiResponse> {
    try {
      const response = await API.post(`/audio/packs/${packId}/samples`, sampleData);
      return {
        success: true,
        data: response.data,
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
      await API.delete(`/audio/packs/${packId}/samples/${sampleId}`);
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

  // Validation (re-export from pack upload service)
  validateCoverImage: packUploadService.validateCoverImage,
  validatePackData: packUploadService.validatePackData,
  validatePackStructure: packUploadService.validatePackStructure,
  generatePackSummary: packUploadService.generatePackSummary,
  calculatePackSize: packUploadService.calculatePackSize
};