import { loginSchema } from "@/lib/validation";
import { authenticateUser, createSession, getSessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid credentials");
    }

    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!user) {
      return fail("Invalid email or password", 401);
    }

    const session = await createSession(user.id);
    const response = ok({ success: true });
    response.cookies.set(SESSION_COOKIE, session.token, getSessionCookieOptions(session.expiresAt));
    return response;
  } catch {
    return fail("Unable to sign in", 500);
  }
}
