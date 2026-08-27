import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AllocateTenantForm } from "@/components/AllocateTenantForm";

export default async function NewTenantPage({ params }: { params: { id: string } }) {
  const unit = await db.unit.findUnique({ where: { id: params.id } });
  if (!unit) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Allocate tenant — {unit.label}</h2>
        <p className="text-xs text-gray-500">{unit.code}</p>
      </div>
      <AllocateTenantForm unitId={unit.id} isCommercial={unit.type === "SHOP"} />
    </div>
  );
}
