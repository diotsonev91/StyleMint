import API from "./config";

const USER_STATS_BASE = "/users/stats";
const USER_PROFILE_BASE = "/users/profile";

export const userProfileApi = {
    /**
     * Get user statistics by user ID
     * @param userId - UUID of the user
     */
    async getUserStats(userId: string) {
        return API.get(`${USER_STATS_BASE}/${userId}`);
    },

    /**
     * Get user profile with statistics
     * @param userId - UUID of the user
     */
    async getUserProfile(userId: string) {
        return API.get(`${USER_PROFILE_BASE}/${userId}`);
    },

    /**
     * Update user display name
     * @param userId - UUID of the user
     * @param displayName - New display name
     */
    async updateDisplayName(userId: string, displayName: string) {
        return API.patch(`${USER_PROFILE_BASE}/${userId}/display-name`, {
            displayName
        });
    },

    /**
     * Update user avatar URL
     * @param userId - UUID of the user
     * @param avatarUrl - New avatar URL
     */
    async updateAvatar(userId: string, avatarUrl: string) {
        return API.patch(`${USER_PROFILE_BASE}/${userId}/avatar`, {
            avatarUrl
        });
    },

    /**
     * Get count of users by role (Admin only)
     */
    async countUsersByRole(userRole: string) {
        return API.get(`${USER_STATS_BASE}/count/role/${userRole}`);
    },

    /**
     * Get count of users registered today (Admin only)
     */
    async countUsersRegisteredToday() {
        return API.get(`${USER_STATS_BASE}/count/today`);
    },

    /**
     * Get count of users registered this week (Admin only)
     */
    async countUsersRegisteredThisWeek() {
        return API.get(`${USER_STATS_BASE}/count/week`);
    },

    /**
     * Get count of users registered this month (Admin only)
     */
    async countUsersRegisteredThisMonth() {
        return API.get(`${USER_STATS_BASE}/count/month`);
    },

    /**
     * Get all registration statistics at once (Admin only)
     */
    async getAllRegistrationStats() {
        return API.get(`${USER_STATS_BASE}/count/all`);
    }
};