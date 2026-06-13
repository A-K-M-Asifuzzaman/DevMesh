/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // True matte black surface scale
        ink: {
          950: "#000000",
          900: "#080808",
          800: "#0f0f0f",
          700: "#161616",
          600: "#1e1e1e",
          500: "#262626",
        },
        // Single accent: cyan only. Blue only as gradient pair.
        neon: {
          cyan: "#00d9ff",
          blue: "#4d7fff",
          // kept for ScoreRing internals only:
          teal: "#0ea5e9",
          lime: "#a3e635",
          magenta: "#ec4899",
        },
        line: "rgba(255,255,255,0.05)",
      },
      fontFamily: {
        display: ['"Clash Display"', "Sora", "sans-serif"],
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', '"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        // Cyan → blue only — no magenta
        "neon-grad": "linear-gradient(110deg,#00d9ff 0%,#4d7fff 100%)",
        "neon-soft": "linear-gradient(135deg,rgba(0,217,255,0.08),rgba(77,127,255,0.06))",
        // Very subtle dot grid
        grid: "radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,217,255,0.1), 0 0 24px -4px rgba(0,217,255,0.2)",
        "glow-sm": "0 0 0 1px rgba(0,217,255,0.08), 0 0 16px -6px rgba(0,217,255,0.15)",
        "glow-blue": "0 0 0 1px rgba(77,127,255,0.12), 0 0 32px -8px rgba(77,127,255,0.25)",
        card: "0 1px 0 rgba(255,255,255,0.02) inset, 0 20px 60px -20px rgba(0,0,0,1)",
        "card-hover": "0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 80px -16px rgba(0,0,0,1)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(0,217,255,0.35)" },
          "70%": { boxShadow: "0 0 0 8px rgba(0,217,255,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,217,255,0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up 0.5s ease forwards",
        "pulse-ring": "pulse-ring 2.4s infinite",
      },
    },
  },
  plugins: [],
};
