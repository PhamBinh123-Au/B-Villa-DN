import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF9F6",
        sand: "#F3EFE6",
        charcoal: "#18181B",
        stonewarm: "#78716C",
        champagne: "#C5A059",
        moss: "#2C3E35",
        brand: {
          DEFAULT: "#C2A476",
          light: "#d4ba94",
          dark: "#a88d5f",
        },
        luxury: {
          bg: "#FAF8F5",
          surface: "#FFFFFF",
          cream: "#F4EFE6",
          dark: "#14171A",
          muted: "#6B6E70",
          accent: "#B89563",
          accentHover: "#9E7D4E",
          border: "#EAE5DC",
          cardDark: "#1E2227",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "var(--font-sans)", "Plus Jakarta Sans", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-plus-jakarta-sans)", "var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        heading: ["var(--font-plus-jakarta-sans)", "var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
