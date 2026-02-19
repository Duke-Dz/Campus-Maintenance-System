/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1F2937",
        campus: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        muted: "#64748b",
        sand: "#F4F7F6",
        ember: "#EF4444",
        gold: "#F59E0B",
        mint: "#10B981",
        surface: {
          light: "#FFFFFF",
          dark: "#1E293B",
          "dark-elevated": "#334155",
        },
        bg: {
          light: "#F4F7F6",
          dark: "#0F172A",
        },
      },
      width: {
        sidebar: "280px",
        "sidebar-collapsed": "80px",
      },
      padding: {
        sidebar: "280px",
        "sidebar-collapsed": "80px",
      },
      boxShadow: {
        panel: "0 20px 45px -25px rgba(15, 23, 42, 0.35)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.06)",
        dropdown: "0 10px 40px -10px rgba(0,0,0,0.15)",
        glow: "0 0 20px rgba(59,130,246,0.2)",
        "glow-lg": "0 0 30px rgba(59,130,246,0.25)",
      },
      animation: {
        "soft-rise": "soft-rise 0.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "slide-in-down": "slide-in-down 0.25s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "spin-slow": "spin 6s linear infinite",
        "spin-reverse": "spin-reverse 4s linear infinite",
        "card-entrance": "card-entrance 0.4s ease-out both",
      },
      keyframes: {
        "soft-rise": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.35)" },
          "100%": { boxShadow: "0 0 0 18px rgba(59, 130, 246, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        "card-entrance": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
