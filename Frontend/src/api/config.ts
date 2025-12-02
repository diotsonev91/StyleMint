import axios, { InternalAxiosRequestConfig } from "axios";

// ==================== API Instance Configuration ====================

const API = axios.create({
    baseURL: "/api/v1", // Vite proxy
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==================== Helper: Get CSRF Token from Cookie ====================

function getCsrfToken(): string | null {
    const cookies = document.cookie.split('; ');
    const csrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
        return csrfCookie.split('=')[1];
    }
    return null;
}

// ==================== Request Interceptor ====================

API.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.withCredentials = true;

        // Add CSRF token for state-changing requests
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                config.headers['X-XSRF-TOKEN'] = csrfToken;
                console.log('✅ CSRF token added:', csrfToken.substring(0, 10) + '...');
            } else {
                console.error('❌ CSRF token NOT found in cookies!');
            }
        }

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

            if (requestUrl.includes('/auth/refresh')) {
                console.log('⛔ Token refresh failed');
                return Promise.reject(error);
            }

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