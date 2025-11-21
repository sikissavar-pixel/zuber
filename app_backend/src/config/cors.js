export const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

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
