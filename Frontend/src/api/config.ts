import axios, { InternalAxiosRequestConfig } from "axios";

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

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            const requestUrl = originalRequest?.url || '';

            // Don't retry refresh endpoint
            if (requestUrl.includes('/auth/refresh')) {
                console.log('⛔ Token refresh failed');
                return Promise.reject(error);
            }

            // Retry with token refresh only once
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    console.log('🔄 Refreshing access token...');
                    await axios.post(
                        `${API.defaults.baseURL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    console.log('✅ Token refreshed, retrying request');
                    return API(originalRequest);
                } catch (refreshError) {
                    console.log('❌ Token refresh failed');
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default API;