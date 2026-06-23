import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? "dev-admin-secret";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return session === getAdminSecret();
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === getAdminSecret();
}
