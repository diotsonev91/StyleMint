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


API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            const requestUrl = originalRequest?.url || '';

            // Ако е /auth/refresh, НЕ опитвай refresh (вече е fail)
            if (requestUrl.includes('/auth/refresh')) {
                console.log('⛔ Token refresh failed - clearing auth');
                return Promise.reject(error);
            }

            // Опитай refresh само веднъж
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    console.log('🔄 Attempting token refresh...');
                    // ✅ ПОПРАВКА: използвай API.defaults.baseURL
                    await axios.post(
                        `${API.defaults.baseURL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    console.log('✅ Token refreshed, retrying original request');
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