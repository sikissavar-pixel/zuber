import axios from "axios";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace("localhost", "127.0.0.1");

const api = axios.create({ baseURL: API });

let token: string | null = null;
export function setAuthToken(t: string | null) {
  token = t;
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;