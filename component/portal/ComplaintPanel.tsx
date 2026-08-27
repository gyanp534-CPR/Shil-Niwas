"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
};

export function ComplaintPanel({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title) {
      setError("Give it a short title, e.g. 'Kitchen tap leaking'.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not submit this.");
      return;
    }
    setTitle("");
    setDescription("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {tickets.length > 0 && (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 p-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.status}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="rounded-lg border border-gray-200 p-3 space-y-2">
        <p className="text-sm font-medium">Raise a new complaint</p>
        <input
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Title, e.g. Kitchen tap leaking"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          placeholder="Details (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 text-white text-sm px-3 py-1.5 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
