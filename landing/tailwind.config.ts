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
        pincer: {
          blue: '#1a365d',
          light: '#2c5282',
          accent: '#63b3ed',
        },
      },
    },
  },
  plugins: [],
};

export default config;
