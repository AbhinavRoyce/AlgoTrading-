/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      colors: {
        background: '#0a0d14',
        surface: '#111827',
        'surface-light': '#1f2937',
        border: '#1f2937',
        'border-light': '#374151',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
        positive: '#22c55e',
        negative: '#ef4444',
        warning: '#f59e0b',
        'text-primary': '#f3f4f6',
        'text-secondary': '#d1d5db',
        'text-muted': '#6b7280',
      },
      keyframes: {
        'pulse-glow': { '0%, 100%': { opacity: '1', boxShadow: '0 0 6px 2px rgba(34,197,94,0.3)' }, '50%': { opacity: '0.6', boxShadow: '0 0 2px 0px rgba(34,197,94,0.1)' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'pulse-glow': 'pulse-glow 2s ease-in-out infinite', 'fade-in': 'fade-in 0.4s ease-out' },
    },
  },
  plugins: [],
};
