/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        wave: {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
        length: {
          from: {
            height: "0%",
          },
          to: {
            height: "100%",
          },
        },
        pulse: {
          "0%": {
            opacity: 0,
            transform: "scale(0.5)",
          },
          "60%": {
            opacity: 1,
            transform: "scale(1.2)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
        expand: {
          from: { maxWidth: "0px" },
          to: { maxWidth: "500px" },
        },
      },
      animation: {
        fadeIn: "fadeIn .75s ease-in forwards",
        "waving-hand": "wave 2s linear infinite",
        "pulsing-dot": "pulse 0.6s forwards",
        "growing-line": "length 0.6s forwards",
        expand: "expand 1s linear forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
