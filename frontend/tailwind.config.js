/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary:"#2B85FF",
        secondary:"#EF863E",
        whitesmoke: '#f5f5f5',
      },
    },
  },
  plugins: [],
}

