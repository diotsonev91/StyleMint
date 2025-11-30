// src/services/GameService.ts
import {
    gameApi,
    GameType,
    type GameResultDTO,
    type LeaderboardEntryDTO,
    type GameSessionDTO,
    type UserGameSummaryDTO
} from "../api/game.api";

interface SaveScoreParams {
    score: number;
    timestamp: number;
    gameName: "bpm-matcher" | "3d-runner";
}

export interface GlobalStats {
    activePlayers: number;
    totalGamesPlayed: number;
    totalHighScores: number;
}

class GameService {
    /** Map game names from client to enum used by backend */
    private mapGameNameToType(gameName: string): GameType {
        switch (gameName) {
            case "bpm-matcher":
                return GameType.BPM_MATCHER;
            case "3d-runner":
                return GameType.COLOR_RUSH;
            default:
                return GameType.COLOR_RUSH;
        }
    }

    /** Submit score to backend */
    async saveScore(params: SaveScoreParams): Promise<{ success: boolean; data?: GameSessionDTO; error?: string }> {
        try {
            const gameResult: GameResultDTO = {
                gameType: this.mapGameNameToType(params.gameName),
                score: params.score,
                durationSeconds: Math.floor(params.timestamp / 1000),
            };

            const response = await gameApi.submitGameResult(gameResult);
            return { success: true, data: response.data };

        } catch (error: any) {
            console.error("❌ Error saving score:", error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to save score"
            };
        }
    }

    async getGlobalStats(): Promise<{ success: boolean; data?: GlobalStats; error?: string }> {
        try {
            const response = await gameApi.getGlobalStats();
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error("❌ Error loading global stats:", error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** Leaderboard for a game type */
    async fetchLeaderboard(
        gameType: GameType,
        limit = 10
    ): Promise<{ success: boolean; data?: LeaderboardEntryDTO[]; error?: string }> {
        try {
            const response = await gameApi.getLeaderboard(gameType, limit);
            return { success: true, data: response.data };

        } catch (error: any) {
            console.error("❌ Error fetching leaderboard:", error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** Global Top scores */
    async fetchTopScores(
        gameType?: GameType
    ): Promise<{ success: boolean; data?: LeaderboardEntryDTO[]; error?: string }> {
        try {
            let response;
            if (!gameType) {
                response = await gameApi.getGlobalLeaderboard(10);
            } else {
                response = await gameApi.getLeaderboard(gameType, 10);
            }
            return { success: true, data: response.data };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** User summary */
    async getUserSummary(): Promise<{ success: boolean; data?: UserGameSummaryDTO; error?: string }> {
        try {
            const response = await gameApi.getUserSummary();
            return { success: true, data: response.data };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** User sessions history */
    async getUserSessions(): Promise<{ success: boolean; data?: GameSessionDTO[]; error?: string }> {
        try {
            const response = await gameApi.getUserSessions();
            return { success: true, data: response.data };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** Claim reward */
    async claimReward(sessionId: string): Promise<{ success: boolean; data?: GameSessionDTO; error?: string }> {
        try {
            const response = await gameApi.claimReward(sessionId);
            return { success: true, data: response.data };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to claim reward"
            };
        }
    }

    /** Unclaimed rewards */
    async getUnclaimedRewards(): Promise<{ success: boolean; data?: GameSessionDTO[]; error?: string }> {
        try {
            const response = await gameApi.getUnclaimedRewards();
            return { success: true, data: response.data };

        } catch (error: any) {
            console.error("❌ Error loading unclaimed rewards:", error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to load rewards"
            };
        }
    }

    /** Best score */
    async getBestScore(gameType: GameType): Promise<{ success: boolean; data?: number; error?: string }> {
        try {
            const response = await gameApi.getBestScore(gameType);
            return { success: true, data: response.data?.bestScore };

        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /** Backend URL */
    getBackendUrl(): string {
        return import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    }
}

export const gameService = new GameService();
export default GameService;

export { GameType } from "../api/game.api";
export type {
    GameResultDTO,
    LeaderboardEntryDTO,
    GameSessionDTO,
    UserGameSummaryDTO,
    SaveScoreParams
};