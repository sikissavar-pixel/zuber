import axios from "axios";

// ⚠️ IMPORTANT: baseURL must point to Railway backend in production
// Vercel env: NEXT_PUBLIC_API_URL=https://zuber-backend-production-071e.up.railway.app
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Warn if env variable is missing in browser (client-side)
if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("⚠️ NEXT_PUBLIC_API_URL not set! API calls will fail in production.");
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