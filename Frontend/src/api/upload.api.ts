// Upload endpoints with multipart form-data

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface UploadSampleDto {
  file: File;
  name: string;
  price: string;
  bpm?: string;
  key?: string;
  genre: string;
  tags: string[];
}

export interface UploadPackDto {
  title: string;
  artist: string;
  price: string;
  description: string;
  genres: string[];
  tags: string[];
  coverImage: File;
  samples: {
    file: File;
    name: string;
    bpm?: number;
    key?: string;
    genre?: string;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Upload API - handles raw HTTP requests to backend
 */
export const uploadApi = {
  /**
   * Upload a single sample
   */
  async uploadSample(data: UploadSampleDto): Promise<Response> {
    const formData = new FormData();
    
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('price', data.price);
    
    if (data.bpm) formData.append('bpm', data.bpm);
    if (data.key) formData.append('key', data.key);
    if (data.genre) formData.append('genre', data.genre);
    formData.append('tags', JSON.stringify(data.tags));

    const response = await fetch(`${API_BASE_URL}/samples/upload`, {
      method: 'POST',
      body: formData,
    });

    return response;
  },

  /**
   * Upload a sample with progress tracking
   */
  uploadSampleWithProgress(
    data: UploadSampleDto,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('price', data.price);
      
      if (data.bpm) formData.append('bpm', data.bpm);
      if (data.key) formData.append('key', data.key);
      if (data.genre) formData.append('genre', data.genre);
      formData.append('tags', JSON.stringify(data.tags));

      // Upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      // Upload complete
      xhr.addEventListener('load', () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        });
        resolve(response);
      });

      // Upload error
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', `${API_BASE_URL}/samples/upload`);
      xhr.send(formData);
    });
  },

  /**
   * Upload a sample pack
   */
  async uploadPack(data: UploadPackDto): Promise<Response> {
    const formData = new FormData();
    
    // Pack information
    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('price', data.price);
    formData.append('description', data.description);
    formData.append('genres', JSON.stringify(data.genres));
    formData.append('tags', JSON.stringify(data.tags));
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    // Samples
    data.samples.forEach((sample, index) => {
      formData.append(`samples[${index}].file`, sample.file);
      formData.append(`samples[${index}].name`, sample.name);
      
      if (sample.bpm) {
        formData.append(`samples[${index}].bpm`, sample.bpm.toString());
      }
      if (sample.key) {
        formData.append(`samples[${index}].key`, sample.key);
      }
      if (sample.genre) {
        formData.append(`samples[${index}].genre`, sample.genre);
      }
    });

    const response = await fetch(`${API_BASE_URL}/packs/upload`, {
      method: 'POST',
      body: formData,
    });

    return response;
  },

  /**
   * Upload a pack with progress tracking
   */
  uploadPackWithProgress(
    data: UploadPackDto,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      // Pack information
      formData.append('title', data.title);
      formData.append('artist', data.artist);
      formData.append('price', data.price);
      formData.append('description', data.description);
      formData.append('genres', JSON.stringify(data.genres));
      formData.append('tags', JSON.stringify(data.tags));
      
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      // Samples
      data.samples.forEach((sample, index) => {
        formData.append(`samples[${index}].file`, sample.file);
        formData.append(`samples[${index}].name`, sample.name);
        
        if (sample.bpm) {
          formData.append(`samples[${index}].bpm`, sample.bpm.toString());
        }
        if (sample.key) {
          formData.append(`samples[${index}].key`, sample.key);
        }
        if (sample.genre) {
          formData.append(`samples[${index}].genre`, sample.genre);
        }
      });

      // Upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      // Upload complete
      xhr.addEventListener('load', () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        });
        resolve(response);
      });

      // Upload error
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', `${API_BASE_URL}/packs/upload`);
      xhr.send(formData);
    });
  },
};