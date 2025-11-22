import pg from "pg";
import bcrypt from "bcryptjs";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.RAILWAY_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PG_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("DATABASE_URL not found");
}

const sslEnv = (process.env.DATABASE_SSL ?? "true").toString().toLowerCase();
export const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255), password TEXT NOT NULL, role VARCHAR(32) NOT NULL, created_at TIMESTAMP DEFAULT NOW())"
  );
  await pool.query(
    "CREATE TABLE IF NOT EXISTS reservations (id SERIAL PRIMARY KEY, partner_id INTEGER NOT NULL REFERENCES users(id), pickup TEXT, dropoff TEXT, scheduled_at TIMESTAMP, status VARCHAR(32) DEFAULT 'open', created_at TIMESTAMP DEFAULT NOW())"
  );
  await pool.query(
    "CREATE TABLE IF NOT EXISTS bids (id SERIAL PRIMARY KEY, reservation_id INTEGER NOT NULL REFERENCES reservations(id), driver_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, created_at TIMESTAMP DEFAULT NOW())"
  );
  await pool.query(
    "CREATE TABLE IF NOT EXISTS driver_applications (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(64), license_type VARCHAR(64), experience VARCHAR(64), description TEXT, status VARCHAR(32) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW())"
  );
  await pool.query(
    "CREATE TABLE IF NOT EXISTS partner_applications (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(64), car_model VARCHAR(64), description TEXT, status VARCHAR(32) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW())"
  );

  async function seedAdmin() {
    const email = "admin@zuber.com";
    const password = "admin123";
    const role = "admin";

    try {
      const check = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
      if (check.rows.length === 0) {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (email, name, password, role) VALUES ($1,$2,$3,$4)", [email, "Admin", hashed, role]);
        console.log("✔ Default admin oluşturuldu:", email);
      } else {
        console.log("✔ Admin zaten mevcut:", email);
      }
    } catch (err) {
      console.error("Admin seed error:", err);
    }
  }

  await seedAdmin();
}