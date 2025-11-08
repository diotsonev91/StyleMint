// src/services/audioSampleService.ts
import API from '../api/config';
import { UploadSampleDto, UpdateSampleMetaDataDto, ApiResponse } from '../api/upload.api';
import { sampleUploadService } from './sampleUploadService';

/**
 * Audio Sample Service - complete sample CRUD operations
 */
export const audioSampleService = {
  // CREATE - Uses sample upload service
  async uploadSample(data: UploadSampleDto): Promise<ApiResponse> {
    return await sampleUploadService.uploadSample(data);
  },

  async uploadSampleWithProgress(
    data: UploadSampleDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    return await sampleUploadService.uploadSampleWithProgress(data, onProgress);
  },

  // READ
  async getMyUploadedSamples(): Promise<ApiResponse> {
    try {
      const response = await API.get('/audio/samples/my-samples');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching user samples:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
async hasUploadedSamples(): Promise<{
  hasSamples: boolean;
  counts?: { ONESHOT: number; LOOP: number };
  totalCount?: number;
  error?: string;
}> {
  try {
    const response = await API.get('audio/samples/my-samples');

    if (response.status === 200) {
      const data = response.data;
      const samples = Array.isArray(data) ? data : data.samples || [];

      const counts = {
        ONESHOT: 0,
        LOOP: 0,
      };

      samples.forEach((sample: any) => {
        if (sample.sampleType === 'ONESHOT') counts.ONESHOT += 1;
        else if (sample.sampleType === 'LOOP') counts.LOOP += 1;
      });

      const totalCount = counts.ONESHOT + counts.LOOP;

      return {
        hasSamples: samples.length > 0,
        counts,
        totalCount,
      };
    }

    return {
      hasSamples: false,
      counts: { ONESHOT: 0, LOOP: 0 },
      totalCount: 0,
    };
  } catch (error: any) {
    console.error('Error checking user samples:', error);
    return {
      hasSamples: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

,
  async getSampleById(sampleId: string): Promise<ApiResponse> {
    try {
      const response = await API.get(`/audio/samples/${sampleId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching sample:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // UPDATE - Uses sample upload validation
  async updateSample(
    sampleId: string, 
    data: UploadSampleDto
  ): Promise<ApiResponse> {
    try {
      // Use upload service validation
      const validation = sampleUploadService.validateSampleData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const formData = new FormData();
      
      if (data.file) {
        formData.append('file', data.file);
      }
      
      formData.append('name', data.name);
      formData.append('artist', data.artist);
      formData.append('price', data.price);
      
      if (data.bpm) formData.append('bpm', data.bpm.toString());
      if (data.musicalKey) formData.append('musicalKey', data.musicalKey);
      if (data.musicalScale) formData.append('musicalScale', data.musicalScale);
      if (data.genre) formData.append('genre', data.genre);
      if (data.sampleType) formData.append('sampleType', data.sampleType);
      if (data.instrumentGroup) formData.append('instrumentGroup', data.instrumentGroup);
      
      data.tags.forEach(tag => {
        formData.append('tags', tag);
      });

      const response = await API.put(`/audio/samples/${sampleId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Sample updated successfully',
      };
    } catch (error: any) {
      console.error('Sample update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Update failed',
      };
    }
  },

  async updateSampleMetadata(
  sampleId: string,
  data: Partial<UpdateSampleMetaDataDto> // или нов DTO: UpdateSampleDto
): Promise<ApiResponse> {

   console.log("updateSampleMetadata() called", sampleId, data);
  try {
    // 🔹 (по желание) може да валидираш само текстовите полета
    if (!data.name|| !data.artist || !data.price) {
      return {
        success: false,
        error: 'Name, artist, and price are required.',
      };
    }
console.log("Validation check:", data);

    const payload = {
      name: data.name,
      artist: data.artist,
      price: data.price,
      bpm: data.bpm || 0,
      musicalKey: data.musicalKey || null,
      musicalScale: data.musicalScale || null,
      genre: data.genre || null,
      sampleType: data.sampleType,
      instrumentGroup: data.instrumentGroup,
      tags: data.tags || [],
    };

    const response = await API.put(`/audio/samples/${sampleId}`, payload, {
      headers: {
        'Content-Type': 'application/json', // 👈 много важно
      },
    });
    console.log("Response received", response);

    return {
      success: true,
      data: response.data,
      message: 'Sample metadata updated successfully',
    };
  } catch (error: any) {
    console.error('Sample metadata update error:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Metadata update failed',
    };
  }
},


  // DELETE
  async deleteSample(sampleId: string): Promise<ApiResponse> {
    try {
      await API.delete(`/audio/samples/${sampleId}`);
      return {
        success: true,
        message: 'Sample deleted successfully',
      };
    } catch (error: any) {
      console.error('Sample delete error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Delete failed',
      };
    }
  },

  // Validation (re-export from upload service)
  validateSampleFile: sampleUploadService.validateSampleFile,
  validateSampleData: sampleUploadService.validateSampleData
};