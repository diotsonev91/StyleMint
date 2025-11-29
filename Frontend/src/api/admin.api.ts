import API from "./config";

const ADMIN_BASE = "/admin";
const STATS_BASE = "/users/stats";

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface AdminClothDesignDTO {
    id: string;
    name: string;
    type: string;
}

export interface AdminSampleDTO {
    id: string;
    name: string;
    category: string;
}

export interface AdminPackDTO {
    id: string;
    name: string;
    sampleCount: number;
}

export interface UserDTO {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    createdAt: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ⭐ User Statistics Types
export interface UserStatsDTO {
    game: any;
    design: any;
    audio: any;
    orders: any;
    created: any;
}

export interface RoleCountDTO {
    role: string;
    count: number;
}

export interface RegistrationCountDTO {
    count: number;
}

export interface AllRegistrationStatsDTO {
    today: number;
    thisWeek: number;
    thisMonth: number;
    byRole: {
        customer: number;
        admin: number;
        designer?: number;
        producer?: number;
        author?: number;
    };
}

// ========================================
// ADMIN USER API
// ========================================

export const adminUserApi = {

    /**
     * Get all users with pagination
     */
    async getAllUsers(page: number = 0, size: number = 20): Promise<Page<UserDTO>> {
        const response = await API.get(`${ADMIN_BASE}/users`, {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<UserDTO> {
        const response = await API.get(`${ADMIN_BASE}/users/email/${encodeURIComponent(email)}`);
        return response.data;
    },

    /**
     * Delete user by ID (admin only)
     */
    async deleteUserAsAdmin(userId: string) {
        return API.delete(`${ADMIN_BASE}/users/${userId}`);
    },

    /**
     * Add role to user (admin only)
     */
    async addRoleToUser(userId: string, role: string) {
        return API.post(`${ADMIN_BASE}/users/${userId}/roles/${role}`);
    },

    /**
     * Remove role from user (admin only)
     */
    async removeRoleFromUser(userId: string, role: string) {
        return API.delete(`${ADMIN_BASE}/users/${userId}/roles/${role}`);
    }
};

// ========================================
// ADMIN PRODUCT API
// ========================================

export const adminProductApi = {

    /**
     * Get all designs with pagination
     */
    async getAllDesigns(page: number = 0, size: number = 20): Promise<Page<AdminClothDesignDTO>> {
        const response = await API.get(`${ADMIN_BASE}/products/designs`, {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Get all samples with pagination
     */
    async getAllSamples(page: number = 0, size: number = 20): Promise<Page<AdminSampleDTO>> {
        const response = await API.get(`${ADMIN_BASE}/products/samples`, {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Get all packs with pagination
     */
    async getAllPacks(page: number = 0, size: number = 20): Promise<Page<AdminPackDTO>> {
        const response = await API.get(`${ADMIN_BASE}/products/packs`, {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Delete design by ID (admin only)
     */
    async deleteDesignAsAdmin(designId: string) {
        return API.delete(`${ADMIN_BASE}/products/designs/${designId}`);
    },

    /**
     * Archive sample by ID (admin only)
     */
    async archiveSampleAsAdmin(sampleId: string) {
        return API.delete(`${ADMIN_BASE}/products/samples/${sampleId}`);
    },

    /**
     * Archive pack by ID (admin only)
     */
    async archivePackAsAdmin(packId: string) {
        return API.delete(`${ADMIN_BASE}/products/packs/${packId}`);
    }
};

// ========================================
// ⭐ ADMIN USER STATISTICS API
// ========================================

export const adminStatsApi = {

    /**
     * Get statistics for a specific user
     */
    async getUserStats(userId: string): Promise<UserStatsDTO> {
        const response = await API.get(`${STATS_BASE}/${userId}`);
        return response.data;
    },

    /**
     * Get count of users by role (Admin only)
     */
    async countUsersByRole(role: string): Promise<RoleCountDTO> {
        const response = await API.get(`${STATS_BASE}/count/role/${role}`);
        return response.data;
    },

    /**
     * Get count of users registered today (Admin only)
     */
    async countUsersRegisteredToday(): Promise<RegistrationCountDTO> {
        const response = await API.get(`${STATS_BASE}/count/today`);
        return response.data;
    },

    /**
     * Get count of users registered this week (Admin only)
     */
    async countUsersRegisteredThisWeek(): Promise<RegistrationCountDTO> {
        const response = await API.get(`${STATS_BASE}/count/week`);
        return response.data;
    },

    /**
     * Get count of users registered this month (Admin only)
     */
    async countUsersRegisteredThisMonth(): Promise<RegistrationCountDTO> {
        const response = await API.get(`${STATS_BASE}/count/month`);
        return response.data;
    },

    /**
     * Get all registration statistics at once (Admin only)
     */
    async getAllRegistrationStats(): Promise<AllRegistrationStatsDTO> {
        const response = await API.get(`${STATS_BASE}/count/all`);
        return response.data;
    }
};