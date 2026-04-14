import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09111f',
        mist: '#d5f0ff',
        glow: '#74d8ff',
        lagoon: '#0f3954'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.25)'
      },
      backdropBlur: {
        glass: '22px'
      }
    }
  },
  plugins: []
};

export default config;
