import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    unitId,
    name,
    phone,
    email,
    permanentAddress,
    idProofType,
    idProofNumber,
    isCommercial,
    businessName,
    businessLicense,
  } = body;

  if (!unitId || !name || !phone) {
    return NextResponse.json({ error: "unitId, name and phone are required" }, { status: 400 });
  }

  const tenant = await db.tenant.create({
    data: {
      unitId,
      name,
      phone,
      email: email || null,
      permanentAddress: permanentAddress || null,
      idProofType: idProofType || null,
      idProofNumber: idProofNumber || null,
      isCommercial: !!isCommercial,
      businessName: businessName || null,
      businessLicense: businessLicense || null,
    },
  });

  return NextResponse.json(tenant, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unitId = searchParams.get("unitId");
  const tenants = await db.tenant.findMany({
    where: unitId ? { unitId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tenants);
}
