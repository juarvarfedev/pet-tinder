import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const shouldUseSsl =
  process.env.DATABASE_SSL?.toLowerCase() === "true" ||
  process.env.PGSSLMODE === "require" ||
  process.env.NODE_ENV === "production" ||
  process.env.DATABASE_URL?.includes("render.com");

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle({ client: pool });
