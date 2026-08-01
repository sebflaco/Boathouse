import type { Metadata, Viewport } from "next";
import { archivo, inter, plexMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boathouse — M.S.R.V. Saurus",
  description: "Training & readiness for the whole crew.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8A1B21",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
