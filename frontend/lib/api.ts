import axios from "axios";

// Normalize localhost to 127.0.0.1 to avoid IPv6 (::1) mismatch
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const baseURL = rawBase.replace("localhost", "127.0.0.1");

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