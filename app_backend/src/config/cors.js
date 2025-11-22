const baseOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const requiredOrigin = "https://zuber-frontend-url.vercel.app";
export const allowedOrigins = Array.from(new Set([...(baseOrigins || []), requiredOrigin]));

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
};
