import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not found");
}

const useSsl = true;

export const pool = new Pool({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : false });

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
}