/**
 * Centralised Axios instance with:
 *  - Base URL from env
 *  - Automatic Authorization header injection
 *  - 401 → token refresh → retry logic
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor – attach Bearer token ─────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor – handle 401 / token refresh ────────────────────
let _isRefreshing = false;
let _failQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  _failQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  _failQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (_isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          _failQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers!["Authorization"] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      _isRefreshing = true;

      const refreshToken = typeof window !== "undefined"
        ? sessionStorage.getItem("refresh_token")
        : null;

      if (!refreshToken) {
        _isRefreshing = false;
        processQueue(error, null);
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newToken: string = data.access_token;
        sessionStorage.setItem("access_token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers!["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
