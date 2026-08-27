import { db } from "@/lib/db";
import Link from "next/link";

export default async function UnitsPage() {
  const units = await db.unit.findMany({
    orderBy: { code: "asc" },
    include: { tenants: true },
  });

  return (
    <div className="space-y-2">
      <h2 className="text-base font-medium mb-3">All units</h2>
      {units.map((u) => (
        <Link
          key={u.id}
          href={`/units/${u.id}`}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium">{u.label}</p>
            <p className="text-xs text-gray-500">{u.code}</p>
          </div>
          <span className="text-xs text-gray-500">{u.status}</span>
        </Link>
      ))}
    </div>
  );
}
