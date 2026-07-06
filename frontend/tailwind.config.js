/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07080C",
          900: "#0B0D13",
          800: "#12141C",
          700: "#191C27",
          600: "#242835",
          border: "#22252F",
        },
        accent: {
          DEFAULT: "#8B7CF6",
          50: "#F1EEFE",
          100: "#E4DEFD",
          400: "#A79AF9",
          500: "#8B7CF6",
          600: "#6D5CE8",
          700: "#5641C9",
        },
        mint: {
          DEFAULT: "#2FD9B8",
          500: "#2FD9B8",
          600: "#1FB89A",
        },
        coral: {
          DEFAULT: "#F76C6C",
          500: "#F76C6C",
        },
        amber: {
          DEFAULT: "#FBBF6B",
          500: "#FBBF6B",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 40px -10px rgba(139, 124, 246, 0.5)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 0%, rgba(139,124,246,0.15), transparent 40%), radial-gradient(circle at 80% 10%, rgba(47,217,184,0.10), transparent 35%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "flow-dash": "flowDash 1.2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        flowDash: {
          to: { strokeDashoffset: -24 },
        },
      },
    },
  },
  plugins: [],
};
