import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { db } from "./db.js";
import * as schema from "./schema.js";
import { dash } from "@better-auth/infra";

const trustedOrigins = [
  process.env.BETTER_AUTH_TRUSTED_ORIGIN,
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

const apiUrl = process.env.BETTER_AUTH_API_URL;
const kvUrl = process.env.BETTER_AUTH_KV_URL;
const apiKey = process.env.BETTER_AUTH_API_KEY;
const secret = process.env.BETTER_AUTH_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }
  if (!apiKey) {
    throw new Error("BETTER_AUTH_API_KEY is required in production");
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins,
  plugins: [
    dash({
      apiUrl,
      kvUrl,
      apiKey,
    }),
  ],
});
