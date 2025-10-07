/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        body: ["Poppins", "Sans-serif"],
      },
      // ✅ ADDED THESE SECTIONS FOR CUSTOM ANIMATIONS
      keyframes: {
        'sonar-wave': {
          '0%': { transform: 'scale(0.1)', opacity: '0.4' },
          '50%': { opacity: '0.2' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'lds-ripple': {
            '0%, 4.9%': { top: '36px', left: '36px', width: '0', height: '0', opacity: '0' },
            '5%': { top: '36px', left: '36px', width: '0', height: '0', opacity: '1' },
            '100%': { top: '0px', left: '0px', width: '72px', height: '72px', opacity: '0' },
        },
      },
      animation: {
        'sonar-wave': 'sonar-wave 2s linear infinite',
        'lds-ripple': 'lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',
      }
    },
  },
  plugins: [],
};