import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { db } from "./db.js";
import * as schema from "./schema.js";

const trustedOrigins = [
  process.env.BETTER_AUTH_TRUSTED_ORIGIN,
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required in production");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins,
});
