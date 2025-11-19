// Game API - handles game-related HTTP requests
// Mirrors the structure of sample.api.ts for consistency
// Game API - CLEAN VERSION matching GameService (metadata removed)

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// ==================== DTOs ====================

export enum GameType {
    COLOR_RUSH = "COLOR_RUSH",
    BPM_MATCHER = "BPM_MATCHER",
}

export enum RewardType {
    DISCOUNT_20 = "DISCOUNT_20",
    DISCOUNT_40 = "DISCOUNT_40",
    NFT_DISCOUNT = "NFT_DISCOUNT",
    NFT_AUTHOR_BADGE = "NFT_AUTHOR_BADGE",
    NONE = "NONE",
}

// Payload sent from client → backend
export interface GameResultDTO {
    gameType: GameType;
    score: number;
    durationSeconds?: number;
    rewardType?: RewardType; // keep this
    // metadata removed
}

// Backend returns GameSessionDTO → metadata removed
export interface GameSessionDTO {
    id: string;
    userId: string;
    gameType: GameType;
    score: number;
    durationSeconds?: number;
    rewardType?: RewardType;
    rewardClaimed: boolean;
    playedAt: string;
    // metadata removed
}

export interface LeaderboardEntryDTO {
    gameType: GameType;
    userId: string;
    displayName: string;
    avatarUrl?: string;
    totalScore: number;
    rank: number;
}

export interface UserGameSummaryDTO {
    totalScore: number;
    gamesPlayed: number;
    gameTypes: GameType[];
    unclaimedRewards: number;
    lastPlayedAt?: string;
    lastRewardType?: RewardType;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ==================== Game API ====================

export const gameApi = {
    async submitGameResult(result: GameResultDTO): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(result),
        });
    },

    async getUserSummary(): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/summary`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getUserSessions(): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/sessions`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getLeaderboard(gameType: GameType, limit: number = 10): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/leaderboard/${gameType}?limit=${limit}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getGlobalLeaderboard(limit: number = 10): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/leaderboard/global?limit=${limit}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async claimReward(sessionId: string): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/sessions/${sessionId}/claim-reward`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getUnclaimedRewards(): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/rewards/unclaimed`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getSessionById(sessionId: string): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/sessions/${sessionId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getBestScore(gameType: GameType): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/best-score/${gameType}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },

    async getUserRank(gameType: GameType): Promise<Response> {
        return fetch(`${API_BASE_URL}/games/rank/${gameType}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
    },
};
