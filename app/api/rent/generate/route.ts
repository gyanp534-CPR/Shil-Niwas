import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Run this once a month (manually, or via a second cron) to create the
// upcoming RentPayment row for every ACTIVE agreement, using each
// agreement's rentDueDay. Idempotent: if a payment already exists for a
// tenant with the same dueDate, it's skipped rather than duplicated.
export async function POST() {
  const activeAgreements = await db.agreement.findMany({
    where: { status: "ACTIVE" },
    include: { tenant: true },
  });

  const now = new Date();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const agreement of activeAgreements) {
    const dueDate = new Date(now.getFullYear(), now.getMonth(), agreement.rentDueDay);

    const existing = await db.rentPayment.findFirst({
      where: {
        tenantId: agreement.tenantId,
        dueDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    });

    if (existing) {
      skipped.push(agreement.tenant.name);
      continue;
    }

    await db.rentPayment.create({
      data: {
        tenantId: agreement.tenantId,
        dueDate,
        amount: agreement.monthlyRent,
      },
    });
    created.push(agreement.tenant.name);
  }

  return NextResponse.json({ created, skipped });
}
