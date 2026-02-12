import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf8f6",
          100: "#d1f0eb",
          200: "#a3e1d7",
          300: "#6ecbbd",
          400: "#3ab39f",
          500: "#169885",
          600: "#0f7a6d",
          700: "#0f6158",
          800: "#104c45",
          900: "#103f39"
        }
      },
      boxShadow: {
        soft: "0 12px 30px -16px rgba(15, 97, 88, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
