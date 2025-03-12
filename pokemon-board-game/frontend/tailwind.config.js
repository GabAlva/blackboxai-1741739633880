/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pokemon-red': 'var(--pokemon-red)',
        'pokemon-blue': 'var(--pokemon-blue)',
        'pokemon-yellow': 'var(--pokemon-yellow)',
        'pokemon-gold': 'var(--pokemon-gold)',
        'pokemon-black': 'var(--pokemon-black)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pokemon: ['Press Start 2P', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        'pokemon': '0 0 10px rgba(255, 222, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-pokemon': 'linear-gradient(to right, var(--pokemon-red), var(--pokemon-blue))',
      },
      borderRadius: {
        'pokemon': '2rem',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        'pokemon': '1200px',
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-85': '85vh',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
  darkMode: 'class',
}
