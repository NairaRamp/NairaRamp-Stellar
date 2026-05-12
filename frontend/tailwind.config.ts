import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    // Override border-radius globally — brutalism uses sharp corners
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '2px',
      md: '4px',
      lg: '4px',
      full: '9999px',
    },
    extend: {
      colors: {
        // Brand greens
        brand: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D',
          muted: '#DCFCE7',
        },
        // Neutral palette
        ink: '#0A0A0A',
        paper: '#FFFFFF',
        off: '#F5F5F0',
        muted: '#6B7280',
        faint: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brut: '4px 4px 0px 0px #0A0A0A',
        'brut-sm': '2px 2px 0px 0px #0A0A0A',
        'brut-lg': '6px 6px 0px 0px #0A0A0A',
        'brut-green': '4px 4px 0px 0px #16A34A',
        'brut-green-lg': '6px 6px 0px 0px #16A34A',
      },
      animation: {
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
