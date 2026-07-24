import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const shouldUseSsl =
  process.env.DATABASE_SSL?.toLowerCase() === "true" ||
  process.env.PGSSLMODE === "require" ||
  process.env.NODE_ENV === "production" ||
  process.env.DATABASE_URL?.includes("render.com");

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: shouldUseSsl ? "require" : undefined,
  },
});
