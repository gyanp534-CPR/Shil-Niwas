import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST body: { unitId, tenantId, startDate, endDate, monthlyRent, securityDeposit,
//              rentDueDay?, noticePeriodDays?, registrationStatus?, photoUrls: string[] }
// photoUrls come from /api/upload — each is saved as a ConditionPhoto row
// linked to this agreement, so it's the move-in reference set.
export async function POST(req: Request) {
  const body = await req.json();
  const {
    unitId,
    tenantId,
    startDate,
    endDate,
    monthlyRent,
    securityDeposit,
    rentDueDay,
    noticePeriodDays,
    registrationStatus,
    photoUrls,
  } = body;

  if (!unitId || !tenantId || !startDate || !endDate || !monthlyRent || !securityDeposit) {
    return NextResponse.json(
      { error: "unitId, tenantId, startDate, endDate, monthlyRent and securityDeposit are required" },
      { status: 400 }
    );
  }

  const agreement = await db.agreement.create({
    data: {
      unitId,
      tenantId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      rentDueDay: rentDueDay ? Number(rentDueDay) : undefined,
      noticePeriodDays: noticePeriodDays ? Number(noticePeriodDays) : undefined,
      registrationStatus: registrationStatus || null,
      status: "ACTIVE",
      moveInPhotos: {
        create: (photoUrls || []).map((url: string) => ({ url })),
      },
    },
    include: { moveInPhotos: true },
  });

  // Allocating a tenant means the unit is now occupied.
  await db.unit.update({
    where: { id: unitId },
    data: { status: "OCCUPIED" },
  });

  return NextResponse.json(agreement, { status: 201 });
}
