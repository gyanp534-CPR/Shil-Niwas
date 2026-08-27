"use client";

import { useState } from "react";
import Link from "next/link";

type Payment = {
  id: string;
  dueDate: string | Date;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
};

export function TenantRentRow({ payment }: { payment: Payment }) {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">₹{payment.amount}</p>
          <p className="text-xs text-gray-500">Due {new Date(payment.dueDate).toLocaleDateString("en-IN")}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${payment.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {payment.isPaid ? "Paid" : "Unpaid"}
        </span>
      </div>

      {payment.isPaid ? (
        <Link href={`/portal/receipts/${payment.id}`} className="text-xs text-blue-700 underline">
          View / download receipt
        </Link>
      ) : (
        <div className="space-y-2">
          <button type="button" onClick={() => setShowQr((s) => !s)} className="text-xs text-blue-700 underline">
            {showQr ? "Hide QR" : "Pay with UPI"}
          </button>
          {showQr && (
            <div>
              <img
                src={`/api/rent/${payment.id}/qr`}
                alt={`UPI payment QR for ₹${payment.amount - payment.paidAmount} rent`}
                className="w-40 h-40 rounded-md border border-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">
                Scan with any UPI app. After paying, the owner will mark this as received.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
