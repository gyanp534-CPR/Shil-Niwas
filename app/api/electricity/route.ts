import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendElectricityBillNotice } from "@/lib/reminders";

// POST body: { unitId: string, currentReading: number, ratePerUnit: number }
// Auto-derives previousReading from the unit's last cycle (0 if this is
// the first-ever reading for that unit — admin should treat that as the
// move-in baseline, ideally logged same day as the room-condition photos).
export async function POST(req: Request) {
  const body = await req.json();
  const { unitId, currentReading, ratePerUnit } = body as {
    unitId: string;
    currentReading: number;
    ratePerUnit: number;
  };

  if (!unitId || currentReading == null || ratePerUnit == null) {
    return NextResponse.json({ error: "unitId, currentReading and ratePerUnit are required" }, { status: 400 });
  }

  const lastCycle = await db.electricityCycle.findFirst({
    where: { unitId },
    orderBy: { cycleDate: "desc" },
  });

  const previousReading = lastCycle ? lastCycle.currentReading : 0;
  const unitsConsumed = currentReading - previousReading;

  if (unitsConsumed < 0) {
    return NextResponse.json(
      { error: "Current reading is lower than the previous reading — check for a meter reset/replacement before saving." },
      { status: 400 }
    );
  }

  const totalAmount = Math.round(unitsConsumed * ratePerUnit * 100) / 100;

  const cycle = await db.electricityCycle.create({
    data: {
      unitId,
      previousReading,
      currentReading,
      unitsConsumed,
      ratePerUnit,
      totalAmount,
    },
  });

  // Send the bill over WhatsApp. Awaited (not fire-and-forget) because
  // serverless functions can freeze/terminate right after the response is
  // sent, which would silently drop a fire-and-forget call. A WhatsApp
  // failure (unconfigured token, network issue, etc.) should never undo the
  // saved reading — the reading is the source of truth; the notification
  // is best-effort.
  try {
    await sendElectricityBillNotice(cycle.id);
  } catch (err) {
    console.error("Failed to send electricity WhatsApp notice:", err);
  }

  return NextResponse.json(cycle, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unitId = searchParams.get("unitId");
  const cycles = await db.electricityCycle.findMany({
    where: unitId ? { unitId } : undefined,
    orderBy: { cycleDate: "desc" },
  });
  return NextResponse.json(cycles);
}
