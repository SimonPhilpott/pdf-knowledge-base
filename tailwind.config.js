/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          tertiary: '#1a2035',
          elevated: '#1e2642',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          muted: 'rgba(255, 255, 255, 0.4)',
        },
        accent: {
          indigo: '#6366f1',
          'indigo-light': '#a5b4fc',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(30, 38, 66, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
