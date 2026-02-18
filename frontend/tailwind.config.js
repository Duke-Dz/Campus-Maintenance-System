/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#1f2a44",
        mint: "#00a895",
        slate: "#64748b",
        sand: "#f8f6ef",
        ember: "#ef4444",
      },
      boxShadow: {
        panel: "0 20px 45px -25px rgba(15, 23, 42, 0.35)",
      },
      animation: {
        "soft-rise": "soft-rise 0.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
      keyframes: {
        "soft-rise": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "pulse-ring": {
          "0%": {
            boxShadow: "0 0 0 0 rgba(0, 168, 149, 0.35)",
          },
          "100%": {
            boxShadow: "0 0 0 18px rgba(0, 168, 149, 0)",
          },
        },
      },
    },
  },
  plugins: [],
};
