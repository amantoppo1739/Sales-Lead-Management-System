"use client";

import axios from "axios";
import { useAuthStore, TOKEN_COOKIE_NAME } from "../store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const getTokenFromCookie = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
};

const resolveToken = () => {
  const stateToken = useAuthStore.getState().token;
  if (stateToken) {
    return stateToken;
  }

  return getTokenFromCookie();
};

api.interceptors.request.use((config) => {
  const token = resolveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      useAuthStore.getState().clearAuth();
      
      // Redirect to login if we're not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export async function login({ email, password }) {
  try {
    const response = await api.post("/auth/login", {
      email: email?.trim(),
      password: password,
      device_name: "frontend",
    }, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const { token, user } = response.data;
    
    if (!token) {
      throw new Error("No token received from server");
    }

    useAuthStore.getState().setAuth({
      token,
      user,
    });

    return response.data;
  } catch (error) {
    // Re-throw with better error message
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors;
      const message = error.response.data?.message || "Validation failed";
      
      if (errors) {
        const errorMessages = Object.entries(errors)
          .flatMap(([field, messages]) => 
            Array.isArray(messages) 
              ? messages.map(msg => `${field}: ${msg}`)
              : [`${field}: ${messages}`]
          );
        throw new Error(errorMessages.join("; ") || message);
      }
      
      throw new Error(message);
    }
    throw error;
  }
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Even if logout fails on server, clear local auth
    console.error("Logout error:", error);
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

export function fetchLeads(params) {
  return api.get("/leads", { params }).then((res) => res.data);
}

export function fetchLead(id) {
  return api.get(`/leads/${id}`).then((res) => res.data);
}

export function createLeadNote(id, payload) {
  return api.post(`/leads/${id}/notes`, payload).then((res) => res.data);
}

export function uploadLeadImport(file) {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post("/imports/leads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
}

export function fetchCurrentUser() {
  return api.get("/auth/me").then((res) => res.data);
}

export function fetchReferenceData() {
  return api.get("/reference-data").then((res) => res.data);
}

export function fetchSettings() {
  return api.get("/settings").then((res) => res.data);
}

export function updateSettings(payload) {
  return api.put("/settings", payload).then((res) => res.data);
}

export function fetchUsers(params) {
  return api.get("/users", { params }).then((res) => res.data);
}

export function fetchTeamUserMetrics({ teamId, from, to }) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  return api
    .get(`/metrics/teams/${teamId}/users`, { params })
    .then((res) => res.data);
}

export function createLead(payload) {
  return api.post("/leads", payload).then((res) => res.data);
}

export function updateLead(id, payload) {
  return api.put(`/leads/${id}`, payload).then((res) => res.data);
}

export function createUser(payload) {
  return api.post("/users", payload).then((res) => res.data);
}

export function updateUser(id, payload) {
  return api.put(`/users/${id}`, payload).then((res) => res.data);
}

export function deactivateUser(id) {
  return api.delete(`/users/${id}`).then((res) => res.data);
}

export async function exportLeads(params, format = 'csv') {
  try {
    const response = await api.get('/leads/export', {
      params: { ...params, format },
      responseType: 'blob',
      validateStatus: (status) => status >= 200 && status < 300,
    });
    
    // Check if response is actually an error (JSON error response)
    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
    if (contentType.includes('application/json')) {
      const text = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || errorData.error || 'Export failed');
    }
    
    // Create download link
    const blob = new Blob([response.data], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.style.display = 'none';
    
    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
    let filename = `leads_export_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (contentDisposition) {
      // Try to extract filename from Content-Disposition header
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        // Handle URL-encoded filename (filename*=UTF-8''...)
        if (filename.startsWith("UTF-8''")) {
          filename = decodeURIComponent(filename.substring(7));
        } else {
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Keep original if decode fails
          }
        }
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    // Handle error responses
    if (error.response?.data) {
      // Try to parse error response if it's a blob
      if (error.response.data instanceof Blob) {
        try {
          const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(error.response.data);
          });
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || 'Export failed');
        } catch (parseError) {
          // If parsing fails, check status code
          if (error.response.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          } else if (error.response.status === 403) {
            throw new Error('You do not have permission to export leads.');
          } else if (error.response.status === 422) {
            throw new Error('Invalid export parameters.');
          } else {
            throw new Error(`Export failed: ${error.response.status} ${error.response.statusText}`);
          }
        }
      } else if (typeof error.response.data === 'object') {
        throw new Error(error.response.data.message || error.response.data.error || 'Export failed');
      }
    }
    throw error;
  }
}

export default api;

