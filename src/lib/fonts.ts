import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";

/**
 * Type system from the prototype:
 *  - Archivo (uppercase, tracked) for labels & headings
 *  - Inter for body copy
 *  - IBM Plex Mono for all numbers & data
 * Exposed as CSS variables consumed by Tailwind's fontFamily config.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
