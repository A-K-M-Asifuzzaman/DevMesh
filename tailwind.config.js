/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Near-black base — deliberately cool, not pure #000
        ink: {
          950: "#05060a",
          900: "#0a0c14",
          800: "#10131f",
          700: "#181c2b",
          600: "#222739",
        },
        // Signature neon: electric cyan -> teal, with a magenta sparingly
        neon: {
          cyan: "#34e7e4",
          teal: "#2dd4bf",
          blue: "#4d7cff",
          lime: "#b6ff3c",
          magenta: "#ff4d9d",
        },
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ['"Clash Display"', "Sora", "sans-serif"],
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', '"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        "neon-grad":
          "linear-gradient(110deg,#34e7e4 0%,#4d7cff 45%,#ff4d9d 100%)",
        "neon-soft":
          "linear-gradient(135deg,rgba(52,231,228,0.18),rgba(77,124,255,0.10) 60%,rgba(255,77,157,0.12))",
        grid: "linear-gradient(rgba(255,255,255,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.045) 1px,transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(52,231,228,0.18), 0 0 40px -8px rgba(52,231,228,0.35)",
        "glow-blue":
          "0 0 0 1px rgba(77,124,255,0.18), 0 0 48px -10px rgba(77,124,255,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.8)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        aurora: {
          "0%": { transform: "translate(-10%,-10%) rotate(0deg)" },
          "50%": { transform: "translate(10%,5%) rotate(180deg)" },
          "100%": { transform: "translate(-10%,-10%) rotate(360deg)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(52,231,228,0.5)" },
          "70%": { boxShadow: "0 0 0 10px rgba(52,231,228,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(52,231,228,0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        aurora: "aurora 28s linear infinite",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2.4s infinite",
      },
    },
  },
  plugins: [],
};
