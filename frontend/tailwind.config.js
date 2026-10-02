/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F5F7FA",
          surface: "#FFFFFF",
          navy: "#123B5D",
          blue: "#2563EB",
          teal: "#0E9F9A",
          text: "#172033",
          secondary: "#64748B",
          border: "#E2E8F0",
          success: "#16A34A",
          warning: "#D97706",
          critical: "#DC2626",
        },
        // Maintain backwards-compat aliases mapped cleanly to the light palette
        industrial: {
          bg: "#F5F7FA",
          card: "#FFFFFF",
          panel: "#F8FAFC",
          border: "#E2E8F0",
          hover: "#F1F5F9",
          text: "#172033",
          muted: "#64748B"
        },
        hazard: {
          critical: "#DC2626",
          high: "#EA580C",
          medium: "#D97706",
          low: "#16A34A"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -1px rgba(16, 24, 40, 0.04)',
      }
    },
  },
  plugins: [],
}
