import API from "./config";

const ADMIN_BASE = "/admin";

// Администраторски методи за управление на потребителите
export const adminUserApi = {
    async deleteUserAsAdmin(userId) {
        return API.delete(`${ADMIN_BASE}/users/${userId}`);
    },

    async addRoleToUser(userId, role) {
        return API.post(`${ADMIN_BASE}/users/${userId}/roles/${role}`);
    },

    async removeRoleFromUser(userId, role) {
        return API.delete(`${ADMIN_BASE}/users/${userId}/roles/${role}`);
    }
};

// Администраторски методи за управление на продукти
export const adminProductApi = {
    async deleteDesignAsAdmin(designId) {
        return API.delete(`${ADMIN_BASE}/products/designs/${designId}`);
    },

    async archiveSampleAsAdmin(sampleId) {
        return API.delete(`${ADMIN_BASE}/products/samples/${sampleId}`);
    },

    async archivePackAsAdmin(packId) {
        return API.delete(`${ADMIN_BASE}/products/packs/${packId}`);
    }
};
