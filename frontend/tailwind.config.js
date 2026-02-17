/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- Added this to enable the Dark Mode toggle
  theme: {
    extend: {
      animation: {
        // --- Your Existing Animations ---
        'blob': "blob 7s infinite",
        'shake': "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 15s linear infinite',
        'reverse-spin': 'reverse-spin 10s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // --- NEW Aurora Animations ---
        'aurora-1': 'aurora 20s ease-in-out infinite alternate',
        'aurora-2': 'aurora 25s ease-in-out infinite alternate-reverse',
        'aurora-3': 'aurora 30s ease-in-out infinite alternate',
      },
      keyframes: {
        // --- Your Existing Keyframes ---
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'reverse-spin': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },

        // --- NEW Aurora Keyframes ---
        aurora: {
          '0%': {
            transform: 'translate(0%, 0%) rotate(0deg) scale(1)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
          '50%': {
            transform: 'translate(10%, 5%) rotate(180deg) scale(1.1)',
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          },
          '100%': {
            transform: 'translate(-5%, 10%) rotate(360deg) scale(1)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
        },
      },
    },
  },
  plugins: [],
};