/** @type {import('tailwindcss').Config} */
const { theme } = require("./src/theme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customBlue: '#1E40AF',
        customPurple: '#6B21A8',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'),    
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      })
    },],
};
