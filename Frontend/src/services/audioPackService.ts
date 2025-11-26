// src/services/audioPackService.ts
import API from '../api/config';
import { UploadPackDto, ApiResponse } from '../api/upload.api';
import { UpdatePackDto } from '../api/update.api'; // You'll need to create this
import { packUploadService } from './packUploadService';
import { packUpdateService } from './packUpdateService'; // Import new service
import { audioSampleService } from './audioSampleService';
import { updateApi } from '../api/update.api';
import {packApi} from "../api/pack.api";

// TODO fix the mess here its too bad to have multiple apis for pack (you use both sample api and pack api

export interface SampleDownloadInfo {
    sampleId: string;
    fileName: string;
    downloadUrl: string;
}

export interface PackDownloadResponse {
    packId: string;
    packTitle: string;
    packCoverImage: string;
    samples: SampleDownloadInfo[];
    isOwner: boolean;
    hasLicense: boolean;
}

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

    updatePackWithProgress: async (packId: string, data: any, onProgress?: (progress: number) => void) => {
        try {
            const response = await updateApi.updatePackWithProgress(packId, data, onProgress);

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('❌ Update failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Update failed'
            };
        }
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

    getPackById: async (packId: string) => {
        try {
            console.log(`📡 Fetching pack ${packId} with samples...`);

            // ✅ Use the /detail endpoint that returns pack + samples
            const response = await API.get(`/audio/packs/${packId}/detail`);

            console.log('✅ Pack fetched successfully:', {
                hasPack: !!response.data?.pack,
                hasSamples: !!response.data?.samples,
                samplesCount: response.data?.samples?.length || 0
            });

            return {
                success: true,
                data: response.data // This contains { pack, samples }
            };
        } catch (error: any) {
            console.error('❌ Failed to fetch pack:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch pack'
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

    unbindSampleFromPack: async (sampleId: string, packId: string) => {
        try {
            console.log(`🗑️ Service: Unbinding sample ${sampleId} from pack ${packId}`);

            const response = await updateApi.unbindSampleFromPack(sampleId, packId);

            if (response.success) {
                console.log('✅ Service: Sample unbound successfully');
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                console.error('❌ Service: Unbind failed:', response.error);
                return {
                    success: false,
                    error: response.error || 'Failed to unbind sample from pack'
                };
            }
        } catch (error: any) {
            console.error('❌ Service: Exception during unbind:', error);
            return {
                success: false,
                error: error.message || 'An error occurred while unbinding sample'
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
  generateUpdateSummary: packUpdateService.generateUpdateSummary,

        /**
         * Download entire pack with all samples
         * Only authorized for:
         * - Pack owner
         * - Users who purchased the pack
         */
        async downloadPack(packId: string): Promise<{
            success: boolean;
            packData?: PackDownloadResponse;
            error?: string;
        }> {
            try {
                const response = await packApi.downloadPack(packId);

                console.log('📦 Download pack response:', response.data);

                // Handle ApiResponse format
                const packData = response.data.success
                    ? response.data.data
                    : response.data;

                if (!packData || !packData.samples || packData.samples.length === 0) {
                    throw new Error('No samples in pack');
                }

                console.log(`✅ Authorized to download pack: ${packData.packTitle}`);
                console.log(`📦 ${packData.samples.length} samples to download`);

                // Download all samples sequentially
                let successCount = 0;
                let failCount = 0;

                for (let i = 0; i < packData.samples.length; i++) {
                    const sample = packData.samples[i];

                    try {
                        console.log(`⬇️ Downloading ${i + 1}/${packData.samples.length}: ${sample.fileName}...`);

                        // ⭐ Download WITHOUT opening new tab
                        await this.downloadSingleSample(sample);

                        successCount++;
                        console.log(`✅ Downloaded: ${sample.fileName} (${successCount}/${packData.samples.length})`);

                        // Small delay between downloads to avoid browser blocking
                        if (i < packData.samples.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
                        }

                    } catch (error) {
                        console.error(`❌ Failed to download: ${sample.fileName}`, error);
                        failCount++;
                    }
                }

                console.log(`📊 Download complete: ${successCount} succeeded, ${failCount} failed`);

                if (successCount === 0) {
                    throw new Error('All downloads failed');
                }

                return {
                    success: true,
                    packData: {
                        ...packData,
                        samples: packData.samples // Return full pack data
                    }
                };

            } catch (error: any) {
                console.error('❌ Download pack error:', error);

                // Handle 403 Forbidden
                if (error.response?.status === 403) {
                    return {
                        success: false,
                        error: 'You need to purchase this pack before downloading it'
                    };
                }

                return {
                    success: false,
                    error: error.response?.data?.error || error.message || 'Download failed'
                };
            }
        },

    /**
     * Download a single sample WITHOUT opening new tab
     * Uses fetch + blob for proper downloads
     */
    async downloadSingleSample(sample: SampleDownloadInfo): Promise<void> {
        try {
            // ⭐ Option 1: Direct link download (simple, works for most cases)
            const link = document.createElement('a');
            link.href = sample.downloadUrl;
            link.download = sample.fileName || `sample-${sample.sampleId}.wav`;
            // ⭐ NO target="_blank" - downloads in same tab
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Small delay to ensure browser processes the download
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error(`Failed to download ${sample.fileName}:`, error);
            throw error;
        }
    },


    /**
     * ⭐⭐⭐ Download entire pack as ZIP file (RECOMMENDED) ⭐⭐⭐
     * Single download, all samples in one ZIP
     */
    async downloadPackAsZip(packId: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            console.log('📦 Downloading pack as ZIP...');

            // Get ZIP blob from backend
            const response = await packApi.downloadPackAsZip(packId);

            // Extract filename from Content-Disposition header if available
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `pack-${packId}.zip`;

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }

            console.log(`📦 ZIP file: ${fileName}`);

            // Create blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/zip' });
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            console.log('✅ ZIP download started successfully');

            return { success: true };

        } catch (error: any) {
            console.error('❌ ZIP download error:', error);

            // Handle 403 Forbidden
            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'You need to purchase this pack before downloading it'
                };
            }

            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Download failed'
            };
        }
    },

};