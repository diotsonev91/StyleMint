// src/services/gameService.ts
import API from "../api/config";

interface GameScore {
  score: number;
  timestamp: number;
  date: string;
  game_mode: string;
  difficulty: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface SaveScoreParams {
  score: number;
  timestamp: number;
  date: string;
  gameMode: string;
  difficulty: string;
  gameName: string;
}

class GameService {
  /**
   * Send score to backend
   * Uses HttpOnly cookies for authentication (SM_ACCESS and SM_REFRESH)
   * The axios instance handles automatic token refresh on 401
   */
  async saveScore(params: SaveScoreParams): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await API.post("/game/scores", {
        score: params.score,
        timestamp: params.timestamp,
        date: params.date,
        gameMode: params.gameMode,
        difficulty: params.difficulty,
        gameName: params.gameName,
      });

      return { success: true, data: response.data };

    } catch (error: any) {
      console.error("❌ Error saving score:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * Fetch top scores from leaderboard
   * Uses HttpOnly cookies for authentication
   */
  async fetchTopScores(): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
    try {
      const response = await API.get("/game/leaderboard/top10");
      return { success: true, data: response.data };

    } catch (error: any) {
      console.error("❌ Error fetching leaderboard:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * Get mock scores (fallback when backend is unavailable)
   */
  getMockScores(gameType: "bpm" | "runner"): LeaderboardEntry[] {
    if (gameType === "bpm") {
      return [
        { rank: 1, username: "BeatMaster", score: 9850 },
        { rank: 2, username: "RhythmKing", score: 9420 },
        { rank: 3, username: "MusicPro", score: 8990 },
        { rank: 4, username: "TempoPro", score: 8450 },
        { rank: 5, username: "BassHunter", score: 7980 },
        { rank: 6, username: "DrumMaster", score: 7520 },
        { rank: 7, username: "SynthWave", score: 7100 },
      ];
    } else {
      return [
        { rank: 1, username: "ProRunner", score: 15420 },
        { rank: 2, username: "SpeedDemon", score: 14850 },
        { rank: 3, username: "NightRacer", score: 13990 },
        { rank: 4, username: "CyberSprint", score: 12750 },
        { rank: 5, username: "PixelJumper", score: 11680 },
        { rank: 6, username: "CyberSprint", score: 12750 },
        { rank: 7, username: "PixelJumper", score: 11680 },
      ];
    }
  }

  /**
   * Get the backend URL (useful for iframe communication)
   */
  getBackendUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  }
}

// Export singleton instance
export const gameService = new GameService();

// Export class for custom instances
export default GameService;

// Export types
export type { GameScore, LeaderboardEntry, SaveScoreParams };