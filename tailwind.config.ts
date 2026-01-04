import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1E8449",
        "primary-dark": "#145A32",
        "primary-light": "#A2D9CE",
        "primary-hover": "#166336",
        "background-light": "#F9FAFB",
        "background-dark": "#111827",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1F2937",
        "card-light": "#FFFFFF",
        "card-dark": "#1F2937",
        "text-light": "#1F2937",
        "text-dark": "#F3F4F6",
        "text-main-light": "#111827",
        "text-main-dark": "#F3F4F6",
        "text-muted-light": "#6B7280",
        "text-muted-dark": "#9CA3AF",
        "text-sub-light": "#6B7280",
        "text-sub-dark": "#9CA3AF",
        "secondary-text-light": "#6B7280",
        "secondary-text-dark": "#9CA3AF",
        "border-light": "#E5E7EB",
        "border-dark": "#374151",
        "input-border-light": "#D1D5DB",
        "input-border-dark": "#374151",
      },
      fontFamily: {
        display: ["var(--font-merriweather)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
        "dm-serif": ["var(--font-dm-serif)", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(30, 132, 73, 0.3)",
      },
      animation: {
        enter: "enter 0.3s ease-out",
        "slide-in": "slideIn 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-in",
      },
      keyframes: {
        enter: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
