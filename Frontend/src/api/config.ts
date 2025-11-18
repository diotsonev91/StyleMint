import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ==================== API Instance Configuration ====================

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==================== Request Interceptor ====================

API.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== Response Interceptor ====================

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Only handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Don't retry auth endpoints
            if (
                originalRequest.url?.includes("/auth/refresh") ||
                originalRequest.url?.includes("/auth/login")
            ) {
                console.warn("⛔ 401 on auth endpoint → redirecting to login");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            // Queue requests if already refreshing
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => API(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log("🔄 Attempting token refresh...");
                // ✅ Just try to refresh - backend will check HttpOnly cookies
                await API.post("/auth/refresh", {}, { withCredentials: true });
                console.log("✅ Token refreshed successfully");

                processQueue();
                return API(originalRequest);

            } catch (refreshError) {
                console.error("❌ Token refresh failed");
                processQueue(refreshError);

                // Refresh failed → user needs to login
                console.warn("⛔ Redirecting to login");
                window.location.href = "/login";

                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        // All other errors
        return Promise.reject(error);
    }
);

export default API;