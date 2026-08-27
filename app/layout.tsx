import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Shil Niwas",
  description: "Property management for Shil Niwas",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F2937",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <PwaRegister />
          <header className="border-b border-gray-200 px-4 py-3">
            <h1 className="text-lg font-medium">Shil Niwas</h1>
          </header>
          <main className="max-w-3xl mx-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
