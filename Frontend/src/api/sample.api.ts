// Sample CRUD operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface SampleDto {
  id: string;
  name: string;
  artist: string;
  price: number;
  url: string;
  duration?: number;
  bpm?: number;
  key?: string;
  genre?: string; 
  coverImage?: string;
  tags?: string[];
  createdAt: string;
}

export interface SampleFilterParams {
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  bpm?: number;
  key?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Sample API - handles sample-related HTTP requests
 */
export const sampleApi = {
  /**
   * Get all samples with optional filters
   */
  async getSamples(filters?: SampleFilterParams): Promise<Response> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `${API_BASE_URL}/samples${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  },

  /**
   * Get sample by ID
   */
  async getSampleById(id: string): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  },

  /**
   * Get sample audio stream URL
   */
  getSampleStreamUrl(id: string): string {
    return `${API_BASE_URL}/samples/${id}/stream`;
  },

  /**
   * Download sample (for purchased items)
   */
  async downloadSample(id: string): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/${id}/download`, {
      method: 'GET',
      credentials: 'include',
    });

    return response;
  },

  /**
   * Get user's purchased samples
   */
  async getPurchasedSamples(): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/purchased`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response;
  },

  /**
   * Get user's uploaded samples
   */
  async getUploadedSamples(): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/my-uploads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response;
  },

  /**
   * Delete sample (if owner)
   */
  async deleteSample(id: string): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response;
  },

  /**
   * Update sample metadata (if owner)
   */
  async updateSample(id: string, data: Partial<SampleDto>): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return response;
  },
};