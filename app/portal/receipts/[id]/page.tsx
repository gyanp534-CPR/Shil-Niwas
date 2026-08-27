import { redirect, notFound } from "next/navigation";
import { getSessionTenant } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/portal/PrintButton";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const tenant = await getSessionTenant();
  if (!tenant) redirect("/portal/login");

  const payment = await db.rentPayment.findUnique({
    where: { id: params.id },
    include: { tenant: { include: { unit: true } } },
  });

  // A tenant may only ever see their own receipt, never anyone else's,
  // even if they guess another payment's id.
  if (!payment || payment.tenantId !== tenant.id) return notFound();
  if (!payment.isPaid) {
    return (
      <div className="max-w-sm mx-auto pt-8 text-center text-sm text-gray-500">
        This payment hasn't been marked as paid yet — a receipt isn't available.
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 space-y-4 print:pt-0">
      <div className="rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="text-center">
          <p className="text-sm font-medium">Rent Receipt</p>
          <p className="text-xs text-gray-500">Shil Niwas</p>
        </div>
        <div className="text-sm space-y-1 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Tenant</span>
            <span>{payment.tenant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Unit</span>
            <span>{payment.tenant.unit.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rent period due</span>
            <span>{new Date(payment.dueDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount paid</span>
            <span>₹{payment.paidAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid on</span>
            <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN") : "—"}</span>
          </div>
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
