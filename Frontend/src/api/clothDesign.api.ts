// clothDesign.api.ts
import API from "./config";

export interface DesignSummaryDTO {
    id: string;
    label: string;
    clothType: string;
    customizationType: string;
    previewImageUrl?: string;
    isPublic: boolean;
    price?: number;
    bonusPoints: number;
    salesCount: number;
    likesCount: number;
    createdAt: string;
}

export interface CustomizationData {
    selectedColor: string;
    selectedDecal: string;
    decalPosition: [number, number, number] | null;
    rotationY: number;
    colors: string[];
    decals: string[];
    selected_type: string;
    page: "intro" | "basic" | "advanced";
    hasCustomDecal: boolean;
    customDecalInfo?: {
        fileName: string;
        fileType: string;
        fileSize: number;
    } | null;
}

export interface SaveDesignRequest {
    label: string;
    clothType: string;
    customizationType: string;
    isPublic: boolean;
    bonusPoints: number;
    customizationJson: string;
    customDecalFile?: File;
}

export interface PublishDesignRequest {
    price: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Cloth Design API - handles design-related HTTP requests using Axios
 */
export const clothDesignApi = {
    /**
     * Save a new design
     */
    async saveDesign(data: FormData): Promise<ApiResponse<DesignSummaryDTO>> {
        const response = await API.post('/designs', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Get user's designs
     */
    async getUserDesigns(): Promise<ApiResponse<DesignSummaryDTO[]>> {
        const response = await API.get('/designs/my-designs');
        return response.data;
    },

    /**
     * Get public designs (marketplace)
     */
    async getPublicDesigns(page?: number, size?: number): Promise<ApiResponse<PaginatedResponse<DesignSummaryDTO>>> {
        const response = await API.get('/designs/public', {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Delete design
     */
    async deleteDesign(designId: string): Promise<ApiResponse> {
        const response = await API.delete(`/designs/${designId}`);
        return response.data;
    },

    /**
     * Publish design
     */
    async publishDesign(designId: string, price: number): Promise<ApiResponse<DesignSummaryDTO>> {
        const response = await API.post(`/designs/${designId}/publish`, { price });
        return response.data;
    },

    /**
     * Unpublish design
     */
    async unpublishDesign(designId: string): Promise<ApiResponse<DesignSummaryDTO>> {
        const response = await API.post(`/designs/${designId}/unpublish`);
        return response.data;
    },
};