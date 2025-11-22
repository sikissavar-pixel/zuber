const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const staticOrigins = [
  "http://localhost:3000",
  "https://zuber-gules.vercel.app",
  "https://www.zuber-gules.vercel.app",
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...staticOrigins]));

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error("❌ BLOCKED ORIGIN:", origin);
    callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
};
