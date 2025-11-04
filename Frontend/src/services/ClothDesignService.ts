// src/services/clothDesignService.ts
// SIMPLE SERVICE - handles design save with optional custom decal

import API from "../api/config";

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

// src/services/clothDesignService.ts
interface CustomizationData {
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

export async function saveDesign(
  state: any,
  label: string,
  isPublic: boolean = false,
  bonusPoints: number = 20
): Promise<DesignSummaryDTO> {
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

  const response = await API.post<DesignSummaryDTO>("/designs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
/**
 * Get user's designs
 */
export async function getUserDesigns(): Promise<DesignSummaryDTO[]> {
  const response = await API.get<DesignSummaryDTO[]>("/designs/my-designs");
  return response.data;
}

/**
 * Get public designs (marketplace)
 */
export async function getPublicDesigns(page: number = 0, size: number = 20): Promise<{
  content: DesignSummaryDTO[];
  totalPages: number;
  totalElements: number;
}> {
  const response = await API.get("/designs/public", {
    params: { page, size },
  });
  return response.data;
}

/**
 * Delete design
 */
export async function deleteDesign(designId: string): Promise<void> {
  await API.delete(`/designs/${designId}`);
}

/**
 * Publish/unpublish design
 */
export async function publishDesign(designId: string, price: number): Promise<DesignSummaryDTO> {
  const response = await API.post<DesignSummaryDTO>(`/designs/${designId}/publish`, { price });
  return response.data;
}

export async function unpublishDesign(designId: string): Promise<DesignSummaryDTO> {
  const response = await API.post<DesignSummaryDTO>(`/designs/${designId}/unpublish`);
  return response.data;
}