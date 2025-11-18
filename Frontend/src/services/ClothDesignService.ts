// clothDesignService.ts - Updated with proper ClothType handling
import {
    clothDesignApi,
    DesignSummaryDTO,
    DesignDetailDTO,
    CustomizationData,
    ApiResponse,
    PaginatedResponse
} from '../api/clothDesign.api';

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

            // Convert to uppercase enum format if needed
            const clothType = state.selected_type?.toUpperCase?.() || state.selected_type;

            formData.append("label", label);
            formData.append("clothType", clothType);
            formData.append("customizationType", state.page === "advanced" ? "ADVANCED" : "BASIC");
            formData.append("isPublic", String(isPublic));
            formData.append("bonusPoints", String(bonusPoints));

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

            if (state.customDecal?.file) {
                formData.append("customDecalFile", state.customDecal.file);
            }

            return await clothDesignApi.saveDesign(formData);
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to save design',
            };
        }
    },

    // READ
    async getUserDesigns(): Promise<ApiResponse<DesignDetailDTO[]>> {
        try {
            return await clothDesignApi.getUserDesigns();
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user designs',
            };
        }
    },

    async getDesignById(designId: string): Promise<ApiResponse<DesignDetailDTO>> {
        try {
            return await clothDesignApi.getDesignById(designId);
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch design',
            };
        }
    },

    async getPublicDesigns(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DesignSummaryDTO>>> {
        try {
            return await clothDesignApi.getPublicDesigns(page, size);
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch public designs',
            };
        }
    },

    // UPDATE
    async updateDesign(
        designId: string,
        state: any,
        label?: string
    ): Promise<ApiResponse<DesignSummaryDTO>> {
        try {
            const formData = new FormData();

            // Convert to uppercase enum format
            const clothType = state.selected_type?.toUpperCase?.() || state.selected_type;

            if (label) formData.append("label", label);
            if (clothType) formData.append("clothType", clothType);
            if (state.page) formData.append("customizationType", state.page === "advanced" ? "ADVANCED" : "BASIC");

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

            if (state.customDecal?.file) {
                formData.append("customDecalFile", state.customDecal.file);
            }

            return await clothDesignApi.updateDesign(designId, formData);
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update design',
            };
        }
    },

    // DELETE
    async deleteDesign(designId: string): Promise<ApiResponse> {
        try {
            return await clothDesignApi.deleteDesign(designId);
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete design',
            };
        }
    },
};