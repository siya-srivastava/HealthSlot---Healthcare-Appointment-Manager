/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          dark: '#115E59',
          light: '#0d9488',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0F766E',
          700: '#115E59',
          800: '#134e4a',
          900: '#042f2e',
        },
        secondary: {
          DEFAULT: '#0284C7',
          light: '#38bdf8',
          dark: '#0369a1',
          50: '#f0f9ff',
          100: '#e0f2fe',
        },
        appBg: '#F8FAFC',
        appText: '#0F172A',
        appMuted: '#64748B',
        appBorder: '#E2E8F0',
        success: {
          DEFAULT: '#16A34A',
          50: '#f0fdf4',
          100: '#dcfce7',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#fffbeb',
          100: '#fef3c7',
        },
        danger: {
          DEFAULT: '#DC2626',
          50: '#fef2f2',
          100: '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(15, 23, 42, 0.07), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
