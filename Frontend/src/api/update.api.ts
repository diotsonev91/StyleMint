// src/api/update.api.ts
import API from './config';

export interface UpdatePackDto {
  title: string;
  artist: string;
  price: string;
  description: string;
  genres: string[];
  tags?: string[];
  coverImage?: File;
  removeCoverImage?: boolean;
  samplesToAdd?: PackSampleDto[];
  existingSamplesToAdd?: string[];
  samplesToRemove?: string[];
}

export interface PackSampleDto {
  file: File;
  name: string;
  bpm?: number;
  musicalKey?: string;
  musicalScale?: string;
  sampleType: string;
  instrumentGroup: string;
  individualPrice?: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Helper function to build FormData
const buildUpdateFormData = (data: UpdatePackDto): FormData => {
  const formData = new FormData();
  
  // Append pack metadata
  formData.append('title', data.title);
  formData.append('artist', data.artist);
  formData.append('price', data.price.toString());
  formData.append('description', data.description);
  
  // Append genres
  data.genres.forEach((genre: string) => {
    formData.append('genres', genre);
  });
  
  // Append tags if provided
  if (data.tags && Array.isArray(data.tags)) {
    data.tags.forEach((tag: string) => {
      formData.append('tags', tag);
    });
  }
  
  // Append cover image if provided
  if (data.coverImage && data.coverImage instanceof File) {
    formData.append('coverImage', data.coverImage);
  }

  // Handle cover image removal flag
  if (data.removeCoverImage) {
    formData.append('removeCoverImage', 'true');
  }

  // Handle samples to remove - ADD DETAILED LOGGING
  if (data.samplesToRemove && Array.isArray(data.samplesToRemove)) {
    console.log('🗑️ updateApi - Building FormData with samplesToRemove:', data.samplesToRemove);
     console.log('🗑️ updateApi - Building FormData with samplesToRemove:', data.samplesToAdd);
    data.samplesToRemove.forEach((sampleId: string, index: number) => {
      console.log(`🗑️ Appending sampleToRemove[${index}]:`, sampleId);
      formData.append(`samplesToRemove[${index}]`, sampleId);
    });
  } else {
    console.log('❌ updateApi - No samplesToRemove found in data');
  }

  // Handle samples to add
  if (data.samplesToAdd && Array.isArray(data.samplesToAdd)) {
    data.samplesToAdd.forEach((sample: PackSampleDto, index: number) => {
      if (sample.file) {
        formData.append(`samplesToAdd[${index}].file`, sample.file);
      }
      formData.append(`samplesToAdd[${index}].name`, sample.name);
      
      if (sample.bpm) formData.append(`samplesToAdd[${index}].bpm`, sample.bpm.toString());
      if (sample.musicalKey) formData.append(`samplesToAdd[${index}].musicalKey`, sample.musicalKey);
      if (sample.musicalScale) formData.append(`samplesToAdd[${index}].musicalScale`, sample.musicalScale);
      if (sample.sampleType) formData.append(`samplesToAdd[${index}].sampleType`, sample.sampleType);
      if (sample.instrumentGroup) formData.append(`samplesToAdd[${index}].instrumentGroup`, sample.instrumentGroup);
      if (sample.individualPrice) formData.append(`samplesToAdd[${index}].individualPrice`, sample.individualPrice.toString());
    });
  }

  // Handle existing samples to add
  if (data.existingSamplesToAdd && Array.isArray(data.existingSamplesToAdd)) {
    data.existingSamplesToAdd.forEach((sampleId: string, index: number) => {
      formData.append(`existingSamplesToAdd[${index}]`, sampleId);
    });
  }

  return formData;
};

export const updateApi = {
  updatePack: (packId: string, data: UpdatePackDto) => {
    const formData = buildUpdateFormData(data);
    
    console.log('📤 Sending to backend (FormData):', {
      packId,
      coverImage: data.coverImage ? {
        name: data.coverImage.name,
        type: data.coverImage.type, 
        size: data.coverImage.size,
        isFile: data.coverImage instanceof File
      } : 'No cover image',
      removeCoverImage: data.removeCoverImage,
      title: data.title,
      samplesToAdd: data.samplesToAdd?.length || 0,
      samplesToRemove: data.samplesToRemove?.length || 0,
      samplesToRemoveDetails: data.samplesToRemove // Log actual array
    });
    
    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`📦 FormData: ${key} =`, value);
    }
    
    return API.put(`/audio/packs/${packId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
    
  updatePackWithProgress: (packId: string, data: UpdatePackDto, onProgress?: (progress: number) => void) => {
    const formData = buildUpdateFormData(data);
    
    console.log('📤 Sending to backend (with progress - FormData):', {
      packId,
      coverImage: data.coverImage ? `${data.coverImage.name} (${data.coverImage.size} bytes)` : 'None',
      removeCoverImage: data.removeCoverImage,
      samplesToRemove: data.samplesToRemove // Log actual array
    });
    
    return API.put(`/audio/packs/${packId}`, formData, {
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
  },
};