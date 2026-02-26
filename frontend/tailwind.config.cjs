module.exports = {
  content: [
    './index.html',
    './**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        bg: 'var(--bg-body)',
        card: 'var(--bg-card)',
        border: 'var(--border)',
        'dark-900': 'var(--bg-body)',
        'dark-800': 'var(--bg-card)',
        'dark-700': 'var(--border)',
        'dark-600': '#334155',
        'brand-500': 'var(--primary)',
        'brand-600': 'var(--primary-hover)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
