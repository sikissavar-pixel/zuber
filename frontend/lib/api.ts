import axios from "axios";

const PROD_BACKEND_FALLBACK = "https://zuber-backend-production-071e.up.railway.app";
const isDev = process.env.NODE_ENV === "development";
const defaultBase = isDev ? "http://localhost:8000" : PROD_BACKEND_FALLBACK;

// ⚠️ IMPORTANT: baseURL must point to Railway backend in production
let rawURL = process.env.NEXT_PUBLIC_API_URL || defaultBase;

// Remove trailing slash to prevent https://domain.app/api/... duplication
// This ensures proper URL construction: baseURL + "/api/..." = "https://domain.app/api/..."
const baseURL = rawURL.endsWith("/") ? rawURL.slice(0, -1) : rawURL;

// Warn if env variable is missing in browser (client-side)
if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL && !isDev) {
  console.warn("⚠️ NEXT_PUBLIC_API_URL not set! Falling back to production backend.");
}

const api = axios.create({
  baseURL,
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