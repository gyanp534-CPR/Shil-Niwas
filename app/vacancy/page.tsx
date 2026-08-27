import { db } from "@/lib/db";
import { FloorMap } from "@/components/FloorMap";

// Public, no-login page. Only status is fetched — tenant names, rent
// amounts, and phone numbers are never selected here, so there's nothing
// sensitive to leak by design, not just by omission in the UI.
export default async function VacancyPage() {
  const units = await db.unit.findMany({
    where: { type: { not: "OWNER_FLAT" } },
    select: { id: true, code: true, label: true, floor: true, type: true, status: true },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Shil Niwas — availability</h2>
        <p className="text-xs text-gray-500">Scan again anytime to check current status.</p>
      </div>
      <FloorMap units={units as any} publicView />
    </div>
  );
}
