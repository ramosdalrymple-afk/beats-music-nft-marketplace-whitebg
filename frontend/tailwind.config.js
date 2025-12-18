/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
      colors: {
        // Dark backgrounds
        dark: {
          base: '#0a0e27',
          card: '#141829',
          secondary: '#1a1f3a',
        },
        // Brand colors
        brand: {
          purple: '#a855f7', // Electric Purple
          cyan: '#06b6d4', // Neon Cyan
          orange: '#ff6b35', // Fire Orange
        },
        // Extended palette
        neon: {
          purple: '#a855f7',
          cyan: '#06b6d4',
          orange: '#ff6b35',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #ff6b35 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #141829 100%)',
        'gradient-purple-orange': 'linear-gradient(135deg, #a855f7 0%, #ff6b35 100%)',
        'gradient-cyan-orange': 'linear-gradient(135deg, #06b6d4 0%, #ff6b35 100%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.2)',
        'brand': '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(168, 85, 247, 0.5)' },
          '50%': { 'box-shadow': '0 0 40px rgba(168, 85, 247, 0.8)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};


