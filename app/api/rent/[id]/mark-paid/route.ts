import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Free-tier UPI has no reliable webhook for payment confirmation without a
// paid payment-gateway subscription, so this stays a manual owner action:
// tenant pays via the QR, owner checks their UPI app, then taps "Mark as
// paid" here.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const existing = await db.rentPayment.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const updated = await db.rentPayment.update({
    where: { id: params.id },
    data: {
      isPaid: true,
      paidAmount: existing.amount,
      paidAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
