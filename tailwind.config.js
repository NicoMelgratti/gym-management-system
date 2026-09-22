/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        e22: {
          bg: '#09090b',
          surface: '#0f0f13',
          card: '#141419',
          cardHover: '#181820',
          border: '#23232b',
          borderLight: '#32323d',
          muted: '#71717a',
          text: '#f4f4f6',
        }
      },
    },
  },
  plugins: [],
};
