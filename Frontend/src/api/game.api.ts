// Game API - handles game-related HTTP requests
// Mirrors the structure of sample.api.ts for consistency

import API from "./config"; // 👈 IMPORT THE AXIOS INSTANCE

// ==================== DTOs ====================

export enum GameType {
    COLOR_RUSH = "COLOR_RUSH",
    BPM_MATCHER = "BPM_MATCHER",
}

export enum RewardType {
    // Standard discounts
    DISCOUNT_20 = "DISCOUNT_20",
    DISCOUNT_40 = "DISCOUNT_40",

    // NFT discounts
    NFT_DISCOUNT_5 = "NFT_DISCOUNT_5",
    NFT_DISCOUNT_7 = "NFT_DISCOUNT_7",

    // NFT author badges
    AUTHOR_BADGE_DESIGNER = "AUTHOR_BADGE_DESIGNER",
    AUTHOR_BADGE_PRODUCER = "AUTHOR_BADGE_PRODUCER",
}

// Payload sent from client → backend
export interface GameResultDTO {
    gameType: GameType;
    score: number;
    durationSeconds?: number;
    rewardType?: RewardType;
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
export interface GlobalStatsDTO {
    activePlayers: number;
    totalGamesPlayed: number;
    totalHighScores: number;
}

// ==================== Game API ====================

export const gameApi = {
    async submitGameResult(result: GameResultDTO): Promise<any> {
        return API.post('/games/submit', result);
    },

    async getUserSummary(): Promise<any> {
        return API.get('/games/summary');
    },

    async getUserSessions(): Promise<any> {
        return API.get('/games/sessions');
    },

    async getLeaderboard(gameType: GameType, limit: number = 10): Promise<any> {
        return API.get(`/games/leaderboard/${gameType}`, {
            params: { limit }
        });
    },

    async getGlobalLeaderboard(limit: number = 10): Promise<any> {
        return API.get('/games/leaderboard/global', {
            params: { limit }
        });
    },

    async claimReward(sessionId: string): Promise<any> {
        return API.post(`/games/sessions/${sessionId}/claim-reward`);
    },

    async getUnclaimedRewards(): Promise<any> {
        return API.get('/games/rewards/unclaimed');
    },

    async getSessionById(sessionId: string): Promise<any> {
        return API.get(`/games/sessions/${sessionId}`);
    },

    async getBestScore(gameType: GameType): Promise<any> {
        return API.get(`/games/best-score/${gameType}`);
    },

    async getUserRank(gameType: GameType): Promise<any> {
        return API.get(`/games/rank/${gameType}`);
    },
    async getGlobalStats(): Promise<any> {
        return API.get('/games/stats/global');
    },
};