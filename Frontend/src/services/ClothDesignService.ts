// clothDesignService.ts
import {
    clothDesignApi,
    DesignSummaryDTO,
    CustomizationData,
    ApiResponse,
    PaginatedResponse
} from '../api/clothDesign.api';

/**
 * Cloth Design Service - complete design CRUD operations using Axios
 */
export const clothDesignService = {
    // CREATE
    async saveDesign(
        state: any,
        label: string,
        isPublic: boolean = false,
        bonusPoints: number = 20
    ): Promise<ApiResponse<DesignSummaryDTO>> {
        try {
            const formData = new FormData();

            // Basic info
            formData.append("label", label);
            formData.append("clothType", state.selected_type);
            formData.append("customizationType", state.page === "advanced" ? "ADVANCED" : "BASIC");
            formData.append("isPublic", String(isPublic));
            formData.append("bonusPoints", String(bonusPoints));

            // Customization data as JSON
            const customizationData: CustomizationData = {
                selectedColor: state.selectedColor,
                selectedDecal: state.selectedDecal,
                decalPosition: state.decalPosition,
                rotationY: state.rotationY,
                colors: state.colors,
                decals: state.decals,
                selected_type: state.selected_type,
                page: state.page,
                hasCustomDecal: !!state.customDecal,
                customDecalInfo: state.customDecal ? {
                    fileName: state.customDecal.file.name,
                    fileType: state.customDecal.file.type,
                    fileSize: state.customDecal.file.size
                } : null
            };

            formData.append("customizationJson", JSON.stringify(customizationData));

            // Custom decal file (if exists)
            if (state.customDecal?.file) {
                formData.append("customDecalFile", state.customDecal.file);
            }

            return await clothDesignApi.saveDesign(formData);

        } catch (error: any) {
            console.error('Design save error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to save design',
            };
        }
    },

    // READ
    async getUserDesigns(): Promise<ApiResponse<DesignSummaryDTO[]>> {
        try {
            return await clothDesignApi.getUserDesigns();
        } catch (error: any) {
            console.error('Error fetching user designs:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user designs',
            };
        }
    },

    async getPublicDesigns(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DesignSummaryDTO>>> {
        try {
            return await clothDesignApi.getPublicDesigns(page, size);
        } catch (error: any) {
            console.error('Error fetching public designs:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch public designs',
            };
        }
    },

    // UPDATE
    async publishDesign(designId: string, price: number): Promise<ApiResponse<DesignSummaryDTO>> {
        try {
            return await clothDesignApi.publishDesign(designId, price);
        } catch (error: any) {
            console.error('Design publish error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to publish design',
            };
        }
    },

    async unpublishDesign(designId: string): Promise<ApiResponse<DesignSummaryDTO>> {
        try {
            return await clothDesignApi.unpublishDesign(designId);
        } catch (error: any) {
            console.error('Design unpublish error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to unpublish design',
            };
        }
    },

    // DELETE
    async deleteDesign(designId: string): Promise<ApiResponse> {
        try {
            return await clothDesignApi.deleteDesign(designId);
        } catch (error: any) {
            console.error('Design delete error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete design',
            };
        }
    },
};

// Legacy function exports for backward compatibility
export async function saveDesign(
    state: any,
    label: string,
    isPublic: boolean = false,
    bonusPoints: number = 20
): Promise<DesignSummaryDTO> {
    const result = await clothDesignService.saveDesign(state, label, isPublic, bonusPoints);
    if (!result.success) {
        throw new Error(result.error || 'Failed to save design');
    }
    return result.data!;
}

export async function getUserDesigns(): Promise<DesignSummaryDTO[]> {
    const result = await clothDesignService.getUserDesigns();
    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user designs');
    }
    return result.data!;
}

export async function getPublicDesigns(page: number = 0, size: number = 20): Promise<PaginatedResponse<DesignSummaryDTO>> {
    const result = await clothDesignService.getPublicDesigns(page, size);
    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch public designs');
    }
    return result.data!;
}

export async function deleteDesign(designId: string): Promise<void> {
    const result = await clothDesignService.deleteDesign(designId);
    if (!result.success) {
        throw new Error(result.error || 'Failed to delete design');
    }
}

export async function publishDesign(designId: string, price: number): Promise<DesignSummaryDTO> {
    const result = await clothDesignService.publishDesign(designId, price);
    if (!result.success) {
        throw new Error(result.error || 'Failed to publish design');
    }
    return result.data!;
}

export async function unpublishDesign(designId: string): Promise<DesignSummaryDTO> {
    const result = await clothDesignService.unpublishDesign(designId);
    if (!result.success) {
        throw new Error(result.error || 'Failed to unpublish design');
    }
    return result.data!;
}