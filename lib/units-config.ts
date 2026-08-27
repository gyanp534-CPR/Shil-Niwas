export type UnitSeed = {
  code: string;
  floor: "GROUND" | "FIRST" | "SECOND";
  type: "BHK_2" | "BHK_1" | "SHOP" | "OWNER_FLAT";
  label: string;
};

// The full 9-unit layout: ground floor (3 shops + 2BHK + 1BHK),
// 1st floor (owner residence), 2nd floor (3x 2BHK)
export const UNITS: UnitSeed[] = [
  { code: "GF-SHOP-SABJI", floor: "GROUND", type: "SHOP", label: "Sabji dukan" },
  { code: "GF-SHOP-GENERAL", floor: "GROUND", type: "SHOP", label: "General store" },
  { code: "GF-SHOP-PARLOUR", floor: "GROUND", type: "SHOP", label: "Beauty parlour" },
  { code: "GF-2BHK", floor: "GROUND", type: "BHK_2", label: "2BHK" },
  { code: "GF-1BHK", floor: "GROUND", type: "BHK_1", label: "1BHK" },
  { code: "1F-OWNER", floor: "FIRST", type: "OWNER_FLAT", label: "Owner flat" },
  { code: "2F-2BHK-A", floor: "SECOND", type: "BHK_2", label: "2BHK - A" },
  { code: "2F-2BHK-B", floor: "SECOND", type: "BHK_2", label: "2BHK - B" },
  { code: "2F-2BHK-C", floor: "SECOND", type: "BHK_2", label: "2BHK - C" },
];

export const FLOOR_ORDER = ["SECOND", "FIRST", "GROUND"] as const;

export const FLOOR_LABEL: Record<string, string> = {
  GROUND: "Ground floor",
  FIRST: "1st floor",
  SECOND: "2nd floor",
};
