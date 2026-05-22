import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#0B1020",
          card: "#111827",
          panel: "#1E293B",
          border: "#334155",
          text: "#F8FAFC",
          muted: "#94A3B8",
          primary: "#3B82F6",
          cyan: "#06B6D4",
          safe: "#22C55E",
          medium: "#F59E0B",
          high: "#F97316",
          critical: "#EF4444"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(2, 6, 23, 0.32)"
      }
    }
  },
  plugins: []
};

export default config;
