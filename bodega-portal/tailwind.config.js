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
        ink: "var(--ink)",
        glass: "var(--glass)",
        line: "var(--line)",
        mint: "#34e0c4",
        aqua: "#37b9ff",
        violet: "#8a76ff",
        magenta: "#e06bd0",
      },
      borderRadius: { glass: "20px" },
      keyframes: {
        floaty: { "0%,100%": { transform: "translate(0,0)" }, "50%": { transform: "translate(0,-6px)" } },
      },
      animation: { floaty: "floaty 6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
