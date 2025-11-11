import API from "./config";
import { MusicalKey, MusicalScale, SampleType, Genre, InstrumentGroup } from "../types/audioEnums";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Data Transfer Objects (DTOs)
export interface UploadSampleDto {
  file: File;
  name: string;
  artist: string;
  price: string;
  bpm?: number;
  musicalKey?: MusicalKey;
  musicalScale?: MusicalScale;
  genre?: Genre;
  sampleType: SampleType;
  instrumentGroup: InstrumentGroup;
  tags: string[];
}

export interface UpdateSampleMetaDataDto {
  name: string;
  artist: string;
  price: string;
  bpm?: number;
  musicalKey?: MusicalKey;
  musicalScale?: MusicalScale;
  genre?: Genre;
  sampleType: SampleType;
  instrumentGroup: InstrumentGroup;
  tags: string[];
  packId?: string;
}

export interface UploadPackDto {
  title: string;
  artist: string;
  price: string;
  description: string;
  genres: Genre[];
  tags: string[];
  coverImage: File;
  existingSampleIds?: string[]; // IDs of existing samples to add
  samples: {
    file: File;
    name: string;
    artist: string;
    bpm?: number;
    musicalKey?: MusicalKey;
    musicalScale?: MusicalScale;
    genre?: Genre;
    sampleType: SampleType;
    instrumentGroup: InstrumentGroup;
  }[];
}

export interface PackSampleDto {
  file: File; // This matches backend MultipartFile file
  name: string; // This matches backend String name
  artist?: string; // Extra field - not in backend, consider removing
  bpm?: number;
  musicalKey?: string; 
  musicalScale?: string;
  sampleType: string; 
  instrumentGroup: string; 

}



export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Upload API - handles multipart/form-data uploads
 */
export const uploadApi = {
  /**
   * Upload a single sample
   */
  async uploadSample(data: UploadSampleDto): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Required fields
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('sampleType', data.sampleType);
    formData.append('instrumentGroup', data.instrumentGroup);
    
    // Optional fields
    if (data.bpm !== undefined && data.bpm !== null) {
      formData.append('bpm', data.bpm.toString());
    }
    if (data.musicalKey) {
      formData.append('musicalKey', data.musicalKey);
    }
    if (data.musicalScale) {
      formData.append('musicalScale', data.musicalScale);
    }
    if (data.genre) {
      formData.append('genre', data.genre);
    }
    
    // Tags as individual form fields (not JSON string)
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    const response = await API.post(`${API_BASE_URL}/audio/samples`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return response.data;
  },

  /**
   * Upload a sample with progress tracking
   */
  async uploadSampleWithProgress(
    data: UploadSampleDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Required fields
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('sampleType', data.sampleType);
    formData.append('instrumentGroup', data.instrumentGroup);
    
    // Optional fields
    if (data.bpm !== undefined && data.bpm !== null) {
      formData.append('bpm', data.bpm.toString());
    }
    if (data.musicalKey) {
      formData.append('musicalKey', data.musicalKey);
    }
    if (data.musicalScale) {
      formData.append('musicalScale', data.musicalScale);
    }
    if (data.genre) {
      formData.append('genre', data.genre);
    }
    
    // Tags as individual form fields
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    const response = await API.post(`${API_BASE_URL}/audio/samples`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Upload a sample pack
   */
  async uploadPack(data: UploadPackDto): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Pack information
    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('description', data.description);
    
    // Genres as individual form fields
    data.genres.forEach((genre, index) => {
      formData.append(`genres[${index}]`, genre);
    });
    
    // Tags as individual form fields
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    if (data.existingSampleIds && data.existingSampleIds.length > 0) {
    data.existingSampleIds.forEach((sampleId, index) => {
      formData.append(`existingSamplesToAdd[${index}]`, sampleId);
    });
  }

    // Samples
    data.samples.forEach((sample, index) => {
      formData.append(`samples[${index}].file`, sample.file);
      formData.append(`samples[${index}].name`, sample.name);
      formData.append(`samples[${index}].artist`, sample.artist);
      formData.append(`samples[${index}].sampleType`, sample.sampleType);
      formData.append(`samples[${index}].instrumentGroup`, sample.instrumentGroup);
      
      if (sample.bpm !== undefined && sample.bpm !== null) {
        formData.append(`samples[${index}].bpm`, sample.bpm.toString());
      }
      if (sample.musicalKey) {
        formData.append(`samples[${index}].musicalKey`, sample.musicalKey);
      }
      if (sample.musicalScale) {
        formData.append(`samples[${index}].musicalScale`, sample.musicalScale);
      }
      if (sample.genre) {
        formData.append(`samples[${index}].genre`, sample.genre);
      }
    });

    const response = await API.post(`${API_BASE_URL}/audio/packs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return response.data;
  },

  /**
   * Upload a sample pack with progress tracking
   */
  async uploadPackWithProgress(
    data: UploadPackDto,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Pack information
    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('description', data.description);
    
    // Genres as individual form fields
    data.genres.forEach((genre, index) => {
      formData.append(`genres[${index}]`, genre);
    });
    
    // Tags as individual form fields
    data.tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    // Samples
    data.samples.forEach((sample, index) => {
      formData.append(`samples[${index}].file`, sample.file);
      formData.append(`samples[${index}].name`, sample.name);
      formData.append(`samples[${index}].artist`, sample.artist);
      formData.append(`samples[${index}].sampleType`, sample.sampleType);
      formData.append(`samples[${index}].instrumentGroup`, sample.instrumentGroup);

      if (data.existingSampleIds && data.existingSampleIds.length > 0) {
    data.existingSampleIds.forEach((sampleId, index) => {
      formData.append(`existingSamplesToAdd[${index}]`, sampleId);
    });
  }
      
      if (sample.bpm !== undefined && sample.bpm !== null) {
        formData.append(`samples[${index}].bpm`, sample.bpm.toString());
      }
      if (sample.musicalKey) {
        formData.append(`samples[${index}].musicalKey`, sample.musicalKey);
      }
      if (sample.musicalScale) {
        formData.append(`samples[${index}].musicalScale`, sample.musicalScale);
      }
      if (sample.genre) {
        formData.append(`samples[${index}].genre`, sample.genre);
      }
    });

    // Handle progress tracking
    return API.post(`${API_BASE_URL}/audio/packs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });
  },
};
