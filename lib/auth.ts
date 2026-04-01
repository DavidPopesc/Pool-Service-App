import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "poolservice_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
};

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function createSessionAndSetCookie(userId: string) {
  const session = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, getSessionCookieOptions(session.expiresAt));
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return {
    id: session.user.id,
    organizationId: session.user.organizationId,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

export async function ensureJobAccess(jobId: string) {
  const user = await requireUser();
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      pool: { include: { customer: true } },
      technician: true,
      checklistItems: true,
      serviceLog: true,
      chemicalLogs: { orderBy: { loggedAt: "desc" }, take: 10 },
      incidentLogs: { orderBy: { createdAt: "desc" }, take: 10, include: { technician: true } },
    },
  });

  if (!job || job.organizationId !== user.organizationId) {
    redirect("/dashboard");
  }

  if (user.role === "TECHNICIAN" && job.technicianId !== user.id) {
    redirect("/my-jobs");
  }

  return { user, job };
}
