import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'fly-out-up': 'fly-out-up 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fly-in-up': 'fly-in-up 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'fly-out-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'fly-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
