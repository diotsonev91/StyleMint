// clothDesign.api.ts
import API from "./config";

export interface DesignSummaryDTO {
    isLikedByUser: boolean;
    id: string;
    label: string;
    clothType: string;
    customizationType: string;
    previewImageUrl?: string;
    isPublic: boolean;
    price?: number;
    bonusPoints: number;
    salesCount: number;
    createdAt: string;
}
export enum ClothType {
    HOODIE = 'HOODIE',
    CAP = 'CAP',
    T_SHIRT_CLASSIC = 'T_SHIRT_CLASSIC',
    T_SHIRT_SPORT = 'T_SHIRT_SPORT',
    SHOE = 'SHOE',
}


// Extended version with full customization data
export interface DesignDetailDTO extends DesignSummaryDTO {
    customizationData: CustomizationData;
    customDecalUrl?: string;
}
export interface DesignPublicDTO extends DesignSummaryDTO {
    customizationData: CustomizationData;
    customDecalUrl?: string;
    likesCount: number;
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
     * Get user's designs (with full details including customizationData)
     */
    async getUserDesigns(): Promise<ApiResponse<DesignDetailDTO[]>> {
        const response = await API.get('/designs/my-designs');
        return response.data;
    },

    /**
     * Get public designs (marketplace) - summary only
     */
    async getPublicDesigns(page?: number, size?: number): Promise<ApiResponse<PaginatedResponse<DesignPublicDTO>>> {
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

    /**
     * Get single design with full details (including customizationData)
     */
    async getDesignById(designId: string): Promise<ApiResponse<DesignDetailDTO>> {
        const response = await API.get(`/designs/${designId}`);
        return response.data;
    },

    /**
     * Update existing design
     */
    async updateDesign(designId: string, data: FormData): Promise<ApiResponse<DesignSummaryDTO>> {
        const response = await API.put(`/designs/${designId}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Get user designer statistics
     */
    async getDesignerSummary(): Promise<ApiResponse<UserDesignerSummaryDTO>> {
        const response = await API.get('/designs/user/me/summary');
        return response.data;
    },

    /**
     * Toggle like on design
     */
    async toggleLike(designId: string): Promise<ApiResponse> {
        const response = await API.post(`/designs/${designId}/like`);
        return response.data;
    },
    /**
     * Get designs by ClothType
     */
    async getDesignsByClothType(clothType: ClothType, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DesignPublicDTO>>> {
        const response = await API.get(`/designs/cloth-type/${clothType}`, {
            params: { page, size }
        });
        return response.data;
    },

    async getPublicDesignsOfUser(userId: string,  page: number = 0, size: number = 20) {
        const response = await API.get(`/designs/user/${userId}/public/`, {
            params: { page, size }
        });
        return response.data;
    }
};

export interface UserDesignerSummaryDTO {
    totalDesigns: number;
    publicDesigns: number;
    privateDesigns: number;
    totalSales: number;
    revenue: number;
}