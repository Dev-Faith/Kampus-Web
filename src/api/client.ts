import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kampus-backend.vercel.app/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("kampus_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("kampus_refresh_token")
            : null;

        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string };
        }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefresh } = data.data;

        if (typeof window !== "undefined") {
          localStorage.setItem("kampus_access_token", accessToken);
          localStorage.setItem("kampus_refresh_token", newRefresh);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("kampus_access_token");
          localStorage.removeItem("kampus_refresh_token");
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
