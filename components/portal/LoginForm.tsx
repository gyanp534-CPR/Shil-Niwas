"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone) {
      setError("Enter your phone number.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not send code.");
      return;
    }
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code) {
      setError("Enter the code sent to your WhatsApp.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid code.");
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  if (step === "phone") {
    return (
      <form onSubmit={requestOtp} className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Phone number</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            inputMode="tel"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 text-white text-sm px-3 py-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send code on WhatsApp"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp} className="space-y-3">
      <p className="text-xs text-gray-500">
        Code sent to {phone} on WhatsApp. It expires in 5 minutes.
      </p>
      <input
        className={inputClass}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit code"
        inputMode="numeric"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-gray-900 text-white text-sm px-3 py-2 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify and log in"}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-xs text-gray-500 underline"
      >
        Use a different number
      </button>
    </form>
  );
}
