/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0002A',
          dark: '#8B0015',
          light: '#FF4D6D',
        },
        blush: '#FFE4EC',
        rose: {
          DEFAULT: '#FF0A54',
          soft: '#FFB3C6',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'float-up': 'float-up 8s ease-in-out infinite',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'match-burst': 'match-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(1)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) rotate(-10deg)', opacity: '0.5' },
          '100%': { transform: 'translateY(-110vh) rotate(10deg)', opacity: '0' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'match-burst': {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(192, 0, 42, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 10, 84, 0.4)',
        card: '0 20px 60px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 30px 80px rgba(192, 0, 42, 0.2)',
      },
    },
  },
  plugins: [],
};
