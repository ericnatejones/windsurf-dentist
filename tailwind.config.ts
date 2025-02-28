import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-blue": "var(--primary-blue)",
        "secondary-blue": "var(--secondary-blue)",
        "cyan-bg": "var(--cyan-bg)",
        cyan: {
          400: "#56C5DA",
        },
        blue: {
          600: "#0069B4",
          700: "#005A9E",
          800: "#004B85",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
