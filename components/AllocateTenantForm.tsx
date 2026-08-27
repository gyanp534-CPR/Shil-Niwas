"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AllocateTenantForm({ unitId, isCommercial }: { unitId: string; isCommercial: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    permanentAddress: "",
    idProofType: "Aadhaar",
    idProofNumber: "",
    businessName: "",
    businessLicense: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    securityDeposit: "",
    registrationStatus: "Unregistered",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone || !form.startDate || !form.endDate || !form.monthlyRent || !form.securityDeposit) {
      setError("Fill in tenant name, phone, dates, rent and deposit — these are all required.");
      return;
    }
    if (photos.length === 0) {
      setError("At least one room-condition photo is required before allocating a tenant.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fd = new FormData();
        fd.append("file", photo);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!upRes.ok) throw new Error("Photo upload failed.");
        const { url } = await upRes.json();
        photoUrls.push(url);
      }

      // 2. Create tenant
      const tenantRes = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          permanentAddress: form.permanentAddress,
          idProofType: form.idProofType,
          idProofNumber: form.idProofNumber,
          isCommercial,
          businessName: form.businessName,
          businessLicense: form.businessLicense,
        }),
      });
      if (!tenantRes.ok) throw new Error("Could not save tenant.");
      const tenant = await tenantRes.json();

      // 3. Create agreement, attach photos
      const agreementRes = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          tenantId: tenant.id,
          startDate: form.startDate,
          endDate: form.endDate,
          monthlyRent: form.monthlyRent,
          securityDeposit: form.securityDeposit,
          registrationStatus: form.registrationStatus,
          photoUrls,
        }),
      });
      if (!agreementRes.ok) throw new Error("Could not save agreement.");

      router.push(`/units/${unitId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm";
  const labelClass = "text-xs text-gray-500 block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Tenant details</h3>
        <div>
          <label className={labelClass}>Full name</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Email (optional)</label>
          <input className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Permanent address</label>
          <input
            className={inputClass}
            value={form.permanentAddress}
            onChange={(e) => update("permanentAddress", e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>ID proof type</label>
            <select
              className={inputClass}
              value={form.idProofType}
              onChange={(e) => update("idProofType", e.target.value)}
            >
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Passport</option>
              <option>Voter ID</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>ID proof number</label>
            <input
              className={inputClass}
              value={form.idProofNumber}
              onChange={(e) => update("idProofNumber", e.target.value)}
            />
          </div>
        </div>
        {isCommercial && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>Business name</label>
              <input
                className={inputClass}
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Shop license / GST</label>
              <input
                className={inputClass}
                value={form.businessLicense}
                onChange={(e) => update("businessLicense", e.target.value)}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">
          Police tenant verification is tracked separately after allocation — see the tenant's status on the unit page.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Agreement</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>Start date</label>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelClass}>End date</label>
            <input
              type="date"
              className={inputClass}
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>Monthly rent (₹)</label>
            <input
              type="number"
              className={inputClass}
              value={form.monthlyRent}
              onChange={(e) => update("monthlyRent", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Security deposit (₹)</label>
            <input
              type="number"
              className={inputClass}
              value={form.securityDeposit}
              onChange={(e) => update("securityDeposit", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Registration status</label>
          <select
            className={inputClass}
            value={form.registrationStatus}
            onChange={(e) => update("registrationStatus", e.target.value)}
          >
            <option>Unregistered</option>
            <option>Notarized</option>
            <option>Registered</option>
          </select>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Room condition photos</h3>
        <p className="text-xs text-gray-400">
          Required. These are saved to the agreement and used as the move-in reference at vacate time.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(e.target.files ? Array.from(e.target.files) : [])}
          className="text-sm"
        />
        {photos.length > 0 && <p className="text-xs text-gray-500">{photos.length} photo(s) selected</p>}
      </section>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gray-900 text-white text-sm px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Allocate tenant"}
      </button>
    </form>
  );
}
