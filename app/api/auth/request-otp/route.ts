import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendWhatsAppTemplate, TEMPLATES } from "@/lib/whatsapp";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Portal login isn't open signup — only phone numbers already on file as a
// tenant (i.e. someone the owner has allocated to a unit) can request a
// code. This deliberately doesn't reveal *why* a number failed beyond a
// generic message, so it can't be used to enumerate which numbers are
// tenants.
export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const tenant = await db.tenant.findFirst({ where: { phone } });
  if (!tenant) {
    return NextResponse.json(
      { error: "No tenant account found for this number. Contact the owner if you believe this is a mistake." },
      { status: 404 }
    );
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.otpCode.create({ data: { phone, code, expiresAt } });

  const result = await sendWhatsAppTemplate(phone, TEMPLATES.OTP_LOGIN, [code]);
  if (!result.ok) {
    return NextResponse.json({ error: "Could not send the code over WhatsApp. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
