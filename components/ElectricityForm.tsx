"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ElectricityForm({ unitId }: { unitId: string }) {
  const router = useRouter();
  const [currentReading, setCurrentReading] = useState("");
  const [ratePerUnit, setRatePerUnit] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!currentReading || !ratePerUnit) {
      setError("Enter both the current reading and the rate per unit.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/electricity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitId,
        currentReading: Number(currentReading),
        ratePerUnit: Number(ratePerUnit),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save this reading.");
      return;
    }
    setCurrentReading("");
    setRatePerUnit("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 p-3 space-y-2">
      <p className="text-sm font-medium">Log new reading</p>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Current meter reading"
          value={currentReading}
          onChange={(e) => setCurrentReading(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Rate per unit (₹)"
          value={ratePerUnit}
          onChange={(e) => setRatePerUnit(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gray-900 text-white text-sm px-3 py-1.5 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Calculate and save"}
      </button>
    </form>
  );
}
