import type { Config } from "tailwindcss";

/**
 * "Regatta" design system — M.S.R.V. Saurus.
 * Palette and type scale mirror the prototype (boathouse.jsx) exactly.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Saurus carmine — primary
        carmine: {
          DEFAULT: "#8A1B21",
          hover: "#6E1418",
        },
        ivory: "#F5F4EF",
        card: "#FFFFFF",
        hairline: "#E4E2D8",
        brass: {
          DEFAULT: "#A8863C",
          soft: "#F3EDDD",
        },
        ink: "#16211C",
        muted: "#6E756C",
        // reserved semantics
        ok: "#2F6B4F", // available / on plan
        danger: "#A94438",
        slate: "#3E5A74", // stress / neutral events
      },
      fontFamily: {
        // Archivo — uppercase, tracked labels & headings
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        // Inter — body
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // IBM Plex Mono — all numbers & data
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.14em",
        head: "0.16em",
        wordmark: "0.3em",
      },
      borderRadius: {
        card: "10px",
      },
      maxWidth: {
        wrap: "1060px",
      },
    },
  },
  plugins: [],
};

export default config;
