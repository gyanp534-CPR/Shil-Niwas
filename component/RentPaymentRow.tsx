"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  dueDate: string | Date;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
};

export function RentPaymentRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);

  async function markPaid() {
    setLoading(true);
    await fetch(`/api/rent/${payment.id}/mark-paid`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  const remaining = payment.amount - payment.paidAmount;

  return (
    <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">₹{payment.amount}</p>
          <p className="text-xs text-gray-500">
            Due {new Date(payment.dueDate).toLocaleDateString("en-IN")}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${payment.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {payment.isPaid ? "Paid" : "Unpaid"}
        </span>
      </div>

      {!payment.isPaid && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQr((s) => !s)}
            className="text-xs text-blue-700 underline"
          >
            {showQr ? "Hide QR" : "Show payment QR"}
          </button>
          <button
            type="button"
            onClick={markPaid}
            disabled={loading}
            className="text-xs rounded-md bg-gray-900 text-white px-2 py-1 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Mark as paid"}
          </button>
        </div>
      )}

      {!payment.isPaid && showQr && (
        <div className="pt-1">
          {/* no-store on the API side means this always reflects the current remaining balance */}
          <img
            src={`/api/rent/${payment.id}/qr`}
            alt={`UPI payment QR for ₹${remaining} rent`}
            className="w-40 h-40 rounded-md border border-gray-200"
          />
          <p className="text-xs text-gray-400 mt-1">Scan with any UPI app — amount is pre-filled.</p>
        </div>
      )}
    </div>
  );
}
