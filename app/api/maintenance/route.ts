import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionTenant } from "@/lib/auth";

export async function POST(req: Request) {
  const tenant = await getSessionTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { title, description } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "A short title is required." }, { status: 400 });
  }

  const ticket = await db.maintenanceTicket.create({
    data: {
      unitId: tenant.unitId,
      tenantId: tenant.id,
      title,
      description: description || null,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
