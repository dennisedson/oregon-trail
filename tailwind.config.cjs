/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        trail: {
          green: "#00b000",
          darkGreen: "#006b25",
          panel: "#f7f7f2",
          paper: "#fff8bf",
          tan: "#efd9a5",
          ink: "#0c0c0c",
          warning: "#d18b00",
          danger: "#b00020"
        }
      },
      fontFamily: {
        trail: ["var(--font-vt323)", "ui-monospace", "monospace"]
      },
      boxShadow: {
        crt: "0 28px 80px rgba(0, 0, 0, 0.78), 0 0 0 5px rgba(255, 255, 255, 0.03)"
      }
    }
  },
  plugins: []
};
