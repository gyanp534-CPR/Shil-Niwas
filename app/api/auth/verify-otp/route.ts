import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { SESSION_COOKIE } from "@/lib/auth";

const SESSION_DAYS = 30;

export async function POST(req: Request) {
  const { phone, code } = await req.json();
  if (!phone || !code) {
    return NextResponse.json({ error: "Phone and code are required." }, { status: 400 });
  }

  const otp = await db.otpCode.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return NextResponse.json({ error: "That code is invalid or has expired. Request a new one." }, { status: 401 });
  }

  await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

  const tenant = await db.tenant.findFirst({ where: { phone } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant account not found." }, { status: 404 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.tenantSession.create({ data: { token, tenantId: tenant.id, expiresAt } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return res;
}
