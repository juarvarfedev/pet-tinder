import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const shouldUseSsl =
  process.env.DATABASE_SSL?.toLowerCase() === "true" ||
  process.env.PGSSLMODE === "require" ||
  process.env.NODE_ENV === "production" ||
  connectionString.includes("render.com");

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

const createAuthTables = async () => {
  await pool.query("BEGIN");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "email_verified" boolean NOT NULL,
        "image" text,
        "created_at" timestamp with time zone NOT NULL,
        "updated_at" timestamp with time zone NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" timestamp with time zone NOT NULL,
        "updated_at" timestamp with time zone NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY NOT NULL,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp with time zone,
        "refresh_token_expires_at" timestamp with time zone,
        "scope" text,
        "password" text,
        "created_at" timestamp with time zone NOT NULL,
        "updated_at" timestamp with time zone NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone,
        "updated_at" timestamp with time zone
      )
    `);

    await pool.query("COMMIT");
    console.log("Better Auth tables are ready.");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
};

createAuthTables().catch((error) => {
  console.error("Could not create Better Auth tables:", error);
  process.exit(1);
});
