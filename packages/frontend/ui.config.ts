export default {
  ui: {
    global: true,
    icons: ['heroicons'],
    safelistColors: ['primary', 'gray', 'red', 'yellow', 'green', 'blue', 'purple'],

    // Configuration personnalisée du thème
    theme: {
      // Palette de couleurs personnalisée
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      // Personnalisation des composants
      button: {
        rounded: 'rounded-md',
        padding: {
          sm: 'px-3 py-1.5',
          md: 'px-4 py-2',
          lg: 'px-6 py-3',
          xl: 'px-8 py-4',
        },
        font: {
          size: {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl',
          },
          weight: 'font-medium',
        },
      },

      card: {
        rounded: 'rounded-lg',
        shadow: 'shadow-md',
        header: {
          padding: 'px-6 py-4',
          border: 'border-b border-gray-200 dark:border-gray-700',
        },
        body: {
          padding: 'p-6',
        },
        footer: {
          padding: 'px-6 py-4',
          border: 'border-t border-gray-200 dark:border-gray-700',
        },
      },

      alert: {
        rounded: 'rounded-md',
        padding: 'p-4',
      },

      badge: {
        rounded: 'rounded-full',
        size: {
          sm: 'text-xs px-2 py-0.5',
          md: 'text-sm px-2.5 py-0.5',
          lg: 'text-base px-3 py-1',
        },
      },

      input: {
        rounded: 'rounded-md',
        padding: 'px-3 py-2',
        shadow: 'shadow-sm',
        focus: 'focus:ring-2 focus:ring-primary-500',
      },
    },
  },
}
