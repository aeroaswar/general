/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque Variable"', "Bricolage Grotesque", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        ink: "#181718",
        paper: "#faf9f9",
        line: "var(--line)",
        accent: "#2562e7",
        blue: "#2562e7",
        mint: "#01dcb4",
        pink: "#fa1e88",
        yellow: "#fae902",
      },
      borderRadius: { brand: "18px" },
    },
  },
  plugins: [],
};
