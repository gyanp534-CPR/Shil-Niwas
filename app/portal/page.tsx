import { redirect } from "next/navigation";
import { getSessionTenant } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/portal/LogoutButton";
import { TenantRentRow } from "@/components/portal/TenantRentRow";
import { ComplaintPanel } from "@/components/portal/ComplaintPanel";

export default async function PortalPage() {
  const tenant = await getSessionTenant();
  if (!tenant) redirect("/portal/login");

  const [agreement, rentPayments, electricityCycles, tickets] = await Promise.all([
    db.agreement.findFirst({
      where: { tenantId: tenant.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    db.rentPayment.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dueDate: "desc" },
      take: 12,
    }),
    db.electricityCycle.findMany({
      where: { unitId: tenant.unitId },
      orderBy: { cycleDate: "desc" },
      take: 6,
    }),
    db.maintenanceTicket.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">{tenant.name}</h2>
          <p className="text-xs text-gray-500">{tenant.unit.label}</p>
        </div>
        <LogoutButton />
      </div>

      {agreement && (
        <section>
          <h3 className="text-sm font-medium mb-2">Your agreement</h3>
          <div className="rounded-lg border border-gray-200 p-3 text-sm">
            <p>Rent: ₹{agreement.monthlyRent}/mo</p>
            <p>
              {new Date(agreement.startDate).toLocaleDateString("en-IN")} →{" "}
              {new Date(agreement.endDate).toLocaleDateString("en-IN")}
            </p>
            {agreement.documentUrl && (
              <a href={agreement.documentUrl} className="text-xs text-blue-700 underline" target="_blank">
                Download signed agreement
              </a>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-medium mb-2">Rent</h3>
        {rentPayments.length > 0 ? (
          <div className="space-y-2">
            {rentPayments.map((p) => (
              <TenantRentRow key={p.id} payment={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No rent dues yet.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Electricity</h3>
        {electricityCycles.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Date</th>
                <th className="py-1">Units</th>
                <th className="py-1">Amount</th>
                <th className="py-1">Paid</th>
              </tr>
            </thead>
            <tbody>
              {electricityCycles.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="py-1">{new Date(c.cycleDate).toLocaleDateString("en-IN")}</td>
                  <td className="py-1">{c.unitsConsumed}</td>
                  <td className="py-1">₹{c.totalAmount}</td>
                  <td className="py-1">{c.isPaid ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400">No electricity bills yet.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Maintenance</h3>
        <ComplaintPanel tickets={tickets as any} />
      </section>
    </div>
  );
}
