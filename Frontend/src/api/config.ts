import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ==================== API Instance Configuration ====================

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // CRITICAL: Always send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== Request Interceptor ====================

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // No need to manually add Authorization header
    // Cookies are automatically sent by the browser
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

        // Only attempt refresh if status = 401
        if (error.response?.status === 401 && !originalRequest._retry) {

            // 1) Prevent retry loops on refresh/login endpoints
            if (
                originalRequest.url?.includes("/auth/refresh") ||
                originalRequest.url?.includes("/auth/login")
            ) {
                return Promise.reject(error);
            }

            // 2) CRITICAL: check for refresh cookie BEFORE retrying
            const hasRefreshCookie = document.cookie.includes("SM_REFRESH=");
            if (!hasRefreshCookie) {
                console.warn("⛔ No refresh cookie → user logged out → redirecting");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            // 3) Already refreshing → queue requests
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
                await API.post("/auth/refresh", {}, { withCredentials: true });

                processQueue();
                return API(originalRequest); // retry original request

            } catch (refreshError) {
                processQueue(refreshError);

                console.warn("⛔ Refresh failed → redirecting to login");
                window.location.href = "/login";

                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export default API;