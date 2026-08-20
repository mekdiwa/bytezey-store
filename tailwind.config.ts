import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050814',
          900: '#0a1026',
          800: '#0e1738',
        },
      },
      boxShadow: {
        'glow-sky': '0 0 25px rgba(56, 189, 248, 0.4)',
        'glow-blue': '0 0 25px rgba(37, 99, 235, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
