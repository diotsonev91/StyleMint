// src/services/GameService.ts
// Refactored to use game.api.ts for consistency

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

    /** Submit score to backend — CLEAN version without metadata */
    async saveScore(params: SaveScoreParams): Promise<{ success: boolean; data?: GameSessionDTO; error?: string }> {
        try {
            const gameResult: GameResultDTO = {
                gameType: this.mapGameNameToType(params.gameName),
                score: params.score,
                durationSeconds: Math.floor(params.timestamp / 1000),
            };

            const response = await gameApi.submitGameResult(gameResult);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error: any) {
            console.error("❌ Error saving score:", error);
            return { success: false, error: error.message || "Failed to save score" };
        }
    }

    /** Leaderboard for a game type */
    async fetchLeaderboard(
        gameType: GameType,
        limit = 10
    ): Promise<{ success: boolean; data?: LeaderboardEntryDTO[]; error?: string }> {
        try {
            const response = await gameApi.getLeaderboard(gameType, limit);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /** Global Top scores */
    async fetchTopScores(
        gameType?: GameType
    ): Promise<{ success: boolean; data?: LeaderboardEntryDTO[]; error?: string }> {

        if (!gameType) {
            try {
                const response = await gameApi.getGlobalLeaderboard(10);

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                return { success: true, data: await response.json() };

            } catch (error: any) {
                return { success: false, error: error.message };
            }
        }

        return this.fetchLeaderboard(gameType);
    }

    /** User summary */
    async getUserSummary(): Promise<{ success: boolean; data?: UserGameSummaryDTO; error?: string }> {
        try {
            const response = await gameApi.getUserSummary();

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            return { success: true, data: await response.json() };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /** User sessions history */
    async getUserSessions(): Promise<{ success: boolean; data?: GameSessionDTO[]; error?: string }> {
        try {
            const response = await gameApi.getUserSessions();

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            return { success: true, data: await response.json() };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /** Claim reward */
    async claimReward(sessionId: string): Promise<{ success: boolean; data?: GameSessionDTO; error?: string }> {
        try {
            const response = await gameApi.claimReward(sessionId);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            return { success: true, data: await response.json() };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /** Unclaimed rewards */
    async getUnclaimedRewards(): Promise<{ success: boolean; data?: GameSessionDTO[]; error?: string }> {
        try {
            const response = await gameApi.getUnclaimedRewards();

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            return { success: true, data: await response.json() };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /** Best score */
    async getBestScore(gameType: GameType): Promise<{ success: boolean; data?: number; error?: string }> {
        try {
            const response = await gameApi.getBestScore(gameType);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            const body = await response.json();
            return { success: true, data: body.bestScore };

        } catch (error: any) {
            return { success: false, error: error.message };
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