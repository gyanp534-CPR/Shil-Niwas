"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden w-full rounded-md bg-gray-900 text-white text-sm px-3 py-2"
    >
      Print / save as PDF
    </button>
  );
}
