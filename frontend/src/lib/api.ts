import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  // Request interceptor: attach token
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nexus_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response interceptor: handle 401
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("nexus_refresh_token");
          if (refreshToken) {
            const resp = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const { access_token, refresh_token } = resp.data;
            localStorage.setItem("nexus_access_token", access_token);
            localStorage.setItem("nexus_refresh_token", refresh_token);
            client.defaults.headers.common.Authorization = `Bearer ${access_token}`;
            return client(originalRequest);
          }
        } catch {
          localStorage.removeItem("nexus_access_token");
          localStorage.removeItem("nexus_refresh_token");
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createApiClient();

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; full_name: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  refresh: (refresh_token: string) => api.post("/auth/refresh", { refresh_token }),
};

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateProfile: (data: { full_name?: string; avatar_url?: string; preferences?: string }) =>
    api.patch("/users/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/users/me/change-password", data),
  updateApiKeys: (data: { gemini_api_key: string }) => api.post("/users/me/api-keys", data),
};

// ── Simulations ───────────────────────────────────────────────
export const simulationsApi = {
  create: (data: {
    prompt: string;
    title?: string;
    tags?: string[];
    domain?: string;
  }) => api.post("/simulations", data),

  list: (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/simulations", { params }),

  get: (id: number) => api.get(`/simulations/${id}`),

  delete: (id: number) => api.delete(`/simulations/${id}`),

  duplicate: (id: number, data?: { title?: string }) =>
    api.post(`/simulations/${id}/duplicate`, data || {}),

  retry: (id: number) => api.post(`/simulations/${id}/retry`),
};

// ── Reports ───────────────────────────────────────────────────
export const reportsApi = {
  generate: (simulationId: number) =>
    api.post(`/reports/simulations/${simulationId}/reports`),

  getPdfUrl: (simulationId: number, reportId: number) =>
    `${API_URL}/api/v1/reports/simulations/${simulationId}/reports/${reportId}/pdf`,
};
