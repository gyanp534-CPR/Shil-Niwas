import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const units = await db.unit.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(units);
}
