import { userProfileApi } from '../api/userProfile.api';

export enum GameType {
    COLOR_RUSH = 'COLOR_RUSH',
    BPM_MATCHER = 'BPM_MATCHER'
}

export enum RewardType {
    // Standard discount rewards
    DISCOUNT_20 = 'DISCOUNT_20',
    DISCOUNT_40 = 'DISCOUNT_40',

    // NFT discount types
    NFT_DISCOUNT_5 = 'NFT_DISCOUNT_5',    // Вечна 5% отстъпка докато държиш NFT
    NFT_DISCOUNT_7 = 'NFT_DISCOUNT_7',    // Вечна 7% отстъпка докато държиш NFT

    // NFT author badge types
    AUTHOR_BADGE_DESIGNER = 'AUTHOR_BADGE_DESIGNER',
    AUTHOR_BADGE_PRODUCER = 'AUTHOR_BADGE_PRODUCER'
}


export interface UserGameSummaryDTO {
    ranks: string[];
    totalRank: string;
    totalScore: number;
    gamesPlayed: number;
    gameTypes: Set<GameType>;
    unclaimedRewards: number;
    lastPlayedAt: string; // ISO date string
    lastRewardType: RewardType;
}

export interface UserDesignerSummaryDTO {
    privateDesigns: number;
    publicDesigns: number;
    totalDesigns: number;
    totalSales?: number;
    revenue?: number;
    averageRating?: number;
}

export interface UserAuthorSummaryDTO {
    totalSamples: number;
    totalPacks: number;
    totalSales: number;
    revenue: number;
}

export interface OrderPreviewDTO {
    id: string;
    // Add other order preview fields as needed
}

export interface UserOrderSummaryDTO {
    totalOrders: number;
    recentOrders: OrderPreviewDTO[];
    totalSpent: number;
    serviceAvailable?: boolean; // ✅ Optional flag for service availability
}

export interface UserCreatedStatsDTO {
    totalDesigns: number;
    totalSamples: number;
    totalPacks: number;
    totalItems: number;
}

export interface UserStatsDTO {
    game: UserGameSummaryDTO;
    design: UserDesignerSummaryDTO;
    audio: UserAuthorSummaryDTO;
    orders: UserOrderSummaryDTO;
    created: UserCreatedStatsDTO;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    AUTHOR = 'AUTHOR',
    DESIGNER = 'DESIGNER'
}

export interface UserProfileDTO {
    id: string; // UUID
    email: string;
    displayName: string;
    avatarUrl: string;
    roles: UserRole[];
    memberSince: string; // ISO date string
    stats: UserStatsDTO;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * User Profile Service - handles user statistics and profile data
 */
export const userProfileService = {
    /**
     * Get user statistics
     */
    async getUserStats(userId: string): Promise<ApiResponse<UserStatsDTO>> {
        try {
            const response = await userProfileApi.getUserStats(userId);

            return {
                success: true,
                data: response.data,
                message: 'User stats retrieved successfully',
            };
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user stats',
            };
        }
    },

    /**
     * Get user profile with statistics
     */
    async getUserProfile(userId: string): Promise<ApiResponse<UserProfileDTO>> {
        try {
            const response = await userProfileApi.getUserProfile(userId);

            return {
                success: true,
                data: response.data,
                message: 'User profile retrieved successfully',
            };
        } catch (error: any) {
            console.error('Error fetching user profile:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user profile',
            };
        }
    },

    /**
     * Update user display name
     */
    async updateDisplayName(userId: string, displayName: string): Promise<ApiResponse<void>> {
        try {
            // Validate display name
            if (!displayName || displayName.trim().length < 2) {
                return {
                    success: false,
                    error: 'Display name must be at least 2 characters long',
                };
            }

            await userProfileApi.updateDisplayName(userId, displayName.trim());

            return {
                success: true,
                message: 'Display name updated successfully',
            };
        } catch (error: any) {
            console.error('Error updating display name:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update display name',
            };
        }
    },

    /**
     * Update user avatar URL
     */
    async updateAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<void>> {
        try {
            // Validate avatar URL
            if (!avatarUrl || avatarUrl.trim().length === 0) {
                return {
                    success: false,
                    error: 'Avatar URL cannot be empty',
                };
            }

            // Basic URL validation
            try {
                new URL(avatarUrl);
            } catch {
                return {
                    success: false,
                    error: 'Invalid URL format',
                };
            }

            await userProfileApi.updateAvatar(userId, avatarUrl.trim());

            return {
                success: true,
                message: 'Avatar updated successfully',
            };
        } catch (error: any) {
            console.error('Error updating avatar:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update avatar',
            };
        }
    },

    /**
     * Delete user profile
     * ⚠️ PERMANENT - Cannot be undone
     */
    async deleteUser(userId: string): Promise<ApiResponse<void>> {
        try {
            await userProfileApi.deleteUser(userId);

            return {
                success: true,
                message: 'User profile deleted successfully',
            };
        } catch (error: any) {
            console.error('Error deleting user:', error);

            // Check for specific error messages
            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'You do not have permission to delete this profile',
                };
            }

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'User not found',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete user profile',
            };
        }
    },

    /**
     * Get count of users by role (Admin only)
     */
    async countUsersByRole(userRole: string): Promise<ApiResponse<{ role: string; count: number }>> {
        try {
            const response = await userProfileApi.countUsersByRole(userRole);

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error fetching user count by role:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user count',
            };
        }
    },

    /**
     * Get count of users registered today (Admin only)
     */
    async countUsersRegisteredToday(): Promise<ApiResponse<{ count: number }>> {
        try {
            const response = await userProfileApi.countUsersRegisteredToday();

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error fetching users registered today:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch count',
            };
        }
    },

    /**
     * Get count of users registered this week (Admin only)
     */
    async countUsersRegisteredThisWeek(): Promise<ApiResponse<{ count: number }>> {
        try {
            const response = await userProfileApi.countUsersRegisteredThisWeek();

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error fetching users registered this week:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch count',
            };
        }
    },

    /**
     * Get count of users registered this month (Admin only)
     */
    async countUsersRegisteredThisMonth(): Promise<ApiResponse<{ count: number }>> {
        try {
            const response = await userProfileApi.countUsersRegisteredThisMonth();

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error fetching users registered this month:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch count',
            };
        }
    },

    /**
     * Get all registration statistics at once (Admin only)
     */
    async getAllRegistrationStats(): Promise<ApiResponse<any>> {
        try {
            const response = await userProfileApi.getAllRegistrationStats();

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error fetching all registration stats:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch stats',
            };
        }
    },

    /**
     * Helper: Calculate total content created
     */
    calculateTotalContent(stats: UserStatsDTO): number {
        return stats.created.totalItems;
    },

    /**
     * Helper: Format currency
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    },

    /**
     * Helper: Format date
     */
    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    },
};