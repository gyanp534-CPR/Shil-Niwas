import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ElectricityForm } from "@/components/ElectricityForm";
import { RentPaymentRow } from "@/components/RentPaymentRow";

export default async function UnitDetailPage({ params }: { params: { id: string } }) {
  const unit = await db.unit.findUnique({
    where: { id: params.id },
    include: {
      tenants: { include: { rentPayments: { orderBy: { dueDate: "desc" }, take: 12 } } },
      agreements: { orderBy: { createdAt: "desc" }, include: { moveInPhotos: true } },
      electricityCycles: { orderBy: { cycleDate: "desc" }, take: 12 },
    },
  });

  if (!unit) return notFound();

  const rentPayments = unit.tenants[0]?.rentPayments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">{unit.label}</h2>
          <p className="text-xs text-gray-500">{unit.code}</p>
        </div>
        {unit.status === "VACANT" && unit.type !== "OWNER_FLAT" && (
          <Link
            href={`/units/${unit.id}/new-tenant`}
            className="rounded-md bg-gray-900 text-white text-sm px-3 py-1.5"
          >
            Allocate tenant
          </Link>
        )}
      </div>

      <section>
        <h3 className="text-sm font-medium mb-2">Current tenant</h3>
        {unit.tenants[0] ? (
          <div className="rounded-lg border border-gray-200 p-3 text-sm">
            <p className="font-medium">{unit.tenants[0].name}</p>
            <p className="text-gray-500">{unit.tenants[0].phone}</p>
            <p className="text-gray-500">Verification: {unit.tenants[0].verificationStatus}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No tenant on record.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Agreement</h3>
        {unit.agreements[0] ? (
          <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-2">
            <p>Status: {unit.agreements[0].status}</p>
            <p>Rent: ₹{unit.agreements[0].monthlyRent}/mo</p>
            <p>
              {new Date(unit.agreements[0].startDate).toLocaleDateString()} →{" "}
              {new Date(unit.agreements[0].endDate).toLocaleDateString()}
            </p>
            {unit.agreements[0].moveInPhotos.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Move-in condition photos</p>
                <div className="grid grid-cols-3 gap-1">
                  {unit.agreements[0].moveInPhotos.map((p) => (
                    <img key={p.id} src={p.url} alt="Room condition at move-in" className="rounded-md aspect-square object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No agreement on record.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Rent</h3>
        {rentPayments.length > 0 ? (
          <div className="space-y-2">
            {rentPayments.map((p) => (
              <RentPaymentRow key={p.id} payment={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No rent dues generated yet — run the monthly rent-generate job to create this month's due.
          </p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Electricity history</h3>
        {unit.electricityCycles.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Date</th>
                <th className="py-1">Units</th>
                <th className="py-1">Rate</th>
                <th className="py-1">Amount</th>
                <th className="py-1">Paid</th>
              </tr>
            </thead>
            <tbody>
              {unit.electricityCycles.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="py-1">{new Date(c.cycleDate).toLocaleDateString()}</td>
                  <td className="py-1">{c.unitsConsumed}</td>
                  <td className="py-1">₹{c.ratePerUnit}</td>
                  <td className="py-1">₹{c.totalAmount}</td>
                  <td className="py-1">{c.isPaid ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400">No readings logged yet.</p>
        )}
        <div className="mt-3">
          <ElectricityForm unitId={unit.id} />
        </div>
      </section>
    </div>
  );
}
