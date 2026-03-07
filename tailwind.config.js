/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // This covers (admin) and (portal)
  ],
  theme: {
    extend: {
      colors: {
        // You can define brand colors here later
        primary: "#3b82f6", 
        admin: "#1e293b",
      },
    },
  },
  plugins: [],
};