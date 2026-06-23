import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  ADMIN_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success && process.env.NODE_ENV === "production") {
    console.warn("[env] validation warnings:", result.error.flatten().fieldErrors);
  }
  return result.success;
}

export function getRequiredEnv(key: "DATABASE_URL"): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
