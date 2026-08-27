import { FLOOR_LABEL, FLOOR_ORDER } from "@/lib/units-config";

export type UnitForMap = {
  id: string;
  code: string;
  label: string;
  floor: "GROUND" | "FIRST" | "SECOND";
  type: "BHK_2" | "BHK_1" | "SHOP" | "OWNER_FLAT";
  status: "OCCUPIED" | "VACANT";
};

// publicView=true hides nothing except it's meant for the no-login QR page:
// same layout, no tenant/financial data is ever passed into this component
// in the first place, so it's safe either way.
export function FloorMap({ units, publicView = false }: { units: UnitForMap[]; publicView?: boolean }) {
  return (
    <div className="space-y-3">
      {FLOOR_ORDER.map((floor) => {
        const floorUnits = units.filter((u) => u.floor === floor);
        if (floorUnits.length === 0) return null;
        return (
          <div key={floor} className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500 mb-2">{FLOOR_LABEL[floor]}</p>
            <div className="grid grid-cols-2 gap-2">
              {floorUnits.map((u) => {
                const isOwner = u.type === "OWNER_FLAT";
                const occupied = u.status === "OCCUPIED";
                const tone = isOwner
                  ? "bg-blue-50 text-blue-800"
                  : occupied
                  ? "bg-green-50 text-green-800"
                  : "bg-amber-50 text-amber-800";
                return (
                  <div key={u.id} className={`rounded-lg p-3 ${tone}`}>
                    <p className="text-sm font-medium">{u.label}</p>
                    <p className="text-xs mt-0.5">
                      {isOwner ? "Owner residence" : occupied ? "Occupied" : "Vacant"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {publicView && (
        <p className="text-xs text-gray-400 pt-1">Contact the owner for details on vacant units.</p>
      )}
    </div>
  );
}
