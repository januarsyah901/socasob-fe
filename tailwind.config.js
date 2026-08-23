/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'midnight-harbor': 'var(--color-midnight-harbor)',
        'signal-blue': 'var(--color-signal-blue)',
        'slate-channel': 'var(--color-slate-channel)',
        'pale-steel': 'var(--color-pale-steel)',
        'sea-fog': 'var(--color-sea-fog)',
        'ice-tint': 'var(--color-ice-tint)',
        'light-mist': 'var(--color-light-mist)',
        'canvas-white': 'var(--color-canvas-white)',
        'active-teal': 'var(--color-active-teal)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-on-accent': 'var(--text-on-accent)',
        // ── Reference compatibility aliases (night-* & dusk-* classes) ──
        night: {
          50: 'var(--color-canvas-white)',
          100: 'var(--color-ice-tint)',
          200: 'var(--color-sea-fog)',
          300: 'var(--color-pale-steel)',
          400: 'var(--color-slate-channel)',
          500: 'var(--color-signal-blue)',
          600: 'var(--color-signal-blue)',
          700: 'var(--color-midnight-harbor)',
          800: 'var(--color-midnight-harbor)',
          900: 'var(--color-midnight-harbor)',
          950: 'var(--color-midnight-harbor)',
        },
        dusk: {
          50: 'var(--color-ice-tint)',
          100: 'var(--color-ice-tint)',
          200: 'var(--color-light-mist)',
          300: 'var(--color-pale-steel)',
          400: 'var(--color-slate-channel)',
          500: 'var(--color-active-teal)',
          600: 'var(--color-active-teal)',
        },
      },

      fontFamily: {
        figtree: ['var(--font-figtree)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-figtree)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        dreamy: 'var(--shadow-dreamy)',
        'dreamy-lg': 'var(--shadow-dreamy-lg)',
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        twinkle: 'twinkle 3s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite alternate',
        'emoji-pop': 'emoji-pop 0.3s ease-out both',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
        drift: {
          '0%': { transform: 'translateX(-4%)' },
          '100%': { transform: 'translateX(4%)' },
        },
        'emoji-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
