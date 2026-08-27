import { db } from "@/lib/db";
import { buildUpiIntentUrl } from "@/lib/upi";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const payment = await db.rentPayment.findUnique({
    where: { id: params.id },
    include: { tenant: { include: { unit: true } } },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Use the remaining balance, not the full amount, so a partially-paid
  // rent still shows a QR for what's actually still owed.
  const remaining = payment.amount - payment.paidAmount;
  const amountToCharge = remaining > 0 ? remaining : payment.amount;

  const dueMonth = new Date(payment.dueDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const note = `Rent ${payment.tenant.unit.label} ${dueMonth}`;

  let upiUrl: string;
  try {
    upiUrl = buildUpiIntentUrl(amountToCharge, note);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const pngBuffer = await QRCode.toBuffer(upiUrl, { type: "png", width: 320, margin: 1 });

  return new NextResponse(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      // Never cache: the amount encoded can change if the payment is
      // partially paid or the rent figure is edited.
      "Cache-Control": "no-store",
    },
  });
}
