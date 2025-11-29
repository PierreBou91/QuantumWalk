/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'cosmic-black': '#0a0a0f',
        'cosmic-purple': '#8b5cf6',
        'cosmic-blue': '#60a5fa',
        'cosmic-indigo': '#6366f1',
        'cosmic-pink': '#ec4899',
        'star-white': '#f8fafc',
        'nebula-purple': '#a78bfa',
        'deep-space': '#030712',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'nebula-rotate': 'nebula-rotate 20s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.5)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'nebula-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.6)',
        'glow-blue': '0 0 20px rgba(96, 165, 250, 0.6)',
        'glow-purple-lg': '0 0 40px rgba(139, 92, 246, 0.8)',
        'glow-blue-lg': '0 0 40px rgba(96, 165, 250, 0.8)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 50%, #0a0a0f 100%)',
        'nebula-gradient': 'radial-gradient(ellipse at top, #6366f1 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
