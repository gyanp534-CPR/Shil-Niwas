import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE = "sn_session";

// Reads the session cookie, loads the matching (non-expired) session, and
// returns the tenant it belongs to — or null if there's no valid session.
// Callers in server components/routes use this to gate access; there's no
// middleware-level redirect, so every portal page and API route under
// /portal and /api/portal must call this and handle the null case itself.
export async function getSessionTenant() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.tenantSession.findUnique({
    where: { token },
    include: { tenant: { include: { unit: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.tenant;
}
