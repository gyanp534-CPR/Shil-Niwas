import { db } from "@/lib/db";
import { FloorMap } from "@/components/FloorMap";

export default async function DashboardPage() {
  const units = await db.unit.findMany({ orderBy: { code: "asc" } });

  const occupied = units.filter((u) => u.status === "OCCUPIED" && u.type !== "OWNER_FLAT").length;
  const rentable = units.filter((u) => u.type !== "OWNER_FLAT").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-medium">
            {occupied}/{rentable}
          </p>
        </div>
        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">Units</p>
          <p className="text-2xl font-medium">{units.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-base font-medium mb-3">Building map</h2>
        <FloorMap units={units} />
      </div>

      <a href="/units" className="inline-block text-sm text-blue-700 underline">
        View all units →
      </a>
      <a href="/portal/login" className="block text-xs text-gray-400 underline">
        Tenant portal login
      </a>
    </div>
  );
}
