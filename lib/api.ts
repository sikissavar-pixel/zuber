import axios from "axios";

// Resolve API base for both local dev and production hosting rewrites.
// Prefer relative base `/api` when NEXT_PUBLIC_API_BASE is provided (Firebase Hosting rewrites).
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
let resolvedBase: string;

if (apiBase && apiBase.startsWith("/")) {
  // Relative path – use same-origin calls
  resolvedBase = apiBase;
} else {
  // Fallback to explicit URL (local dev or custom origin)
  const rawBase = apiBase || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  resolvedBase = rawBase.replace("localhost", "127.0.0.1");
}

const api = axios.create({
  baseURL: resolvedBase,
});

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;