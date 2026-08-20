/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  // Dark mode resolves from EITHER selector so every styling strategy in the
  // codebase switches from the single ThemeService toggle:
  //   [data-theme="dark"] - semantic attribute (source of truth)
  //   .dark               - mirrored class, kept for existing utilities/SCSS
  darkMode: [
    'variant',
    [
      '&:where([data-theme="dark"], [data-theme="dark"] *)',
      '&:where(.dark, .dark *)',
    ],
  ],
  theme: {
    extend: {
      colors: {
        // ------------------------------------------------------------------
        // Semantic theme colors
        // ------------------------------------------------------------------
        // These are read from the custom properties in styles/themes/*.css,
        // so every utility built on them follows [data-theme] automatically —
        // no `dark:` counterpart needed at the call site.
        //
        // They are declared here rather than as hand-written classes for two
        // reasons. `text-foreground` (28 uses) and `text-muted-foreground`
        // (24 uses) had no definition anywhere and were generating no CSS at
        // all, so muted body copy rendered at full strength and the intended
        // hierarchy was flat in both themes. And a hand-written class cannot
        // support the opacity modifier — `border-border/50` was already in the
        // templates and silently doing nothing.
        //
        // The rgb() + <alpha-value> form is what makes `/50` work, which is
        // why the theme files carry `--color-*-channels` triplets beside
        // each hex value. Keep the two in step.
        background: 'rgb(var(--color-background-channels) / <alpha-value>)',
        'background-secondary': 'rgb(var(--color-background-secondary-channels) / <alpha-value>)',
        border: 'rgb(var(--color-border-channels) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong-channels) / <alpha-value>)',
        foreground: 'rgb(var(--color-text-primary-channels) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-text-tertiary-channels) / <alpha-value>)',
        'subtle-foreground': 'rgb(var(--color-text-secondary-channels) / <alpha-value>)',
        // Used both ways in the templates: `text-muted` (3 sites) needs a text
        // colour, `bg-muted/30` (1 site) a wash. One key cannot be both, so it
        // resolves to the muted TEXT colour — that keeps the text legible, and
        // a 30% tint of it still reads as the intended subtle grey wash. The
        // reverse mapping would have rendered `text-muted` invisible.
        muted: 'rgb(var(--color-text-tertiary-channels) / <alpha-value>)',

        // ------------------------------------------------------------------
        // content / surface / edge — the semantic families the templates use
        // ------------------------------------------------------------------
        // These three names carry the bulk of the site's theming: roughly
        // 1,650 call sites across ~90 files use `text-content-secondary`,
        // `border-edge-subtle`, `bg-surface-secondary` and their siblings.
        //
        // None of them were defined. Every one of those classes compiled to
        // nothing, which is why theming looked broken in both modes: text
        // fell back to whatever it inherited (so the primary/secondary/muted
        // hierarchy was flat), card and input borders were absent, and filled
        // plates and table headers had no background at all — most visible in
        // dark mode, where a missing surface leaves the page ground showing
        // through what should be a raised element.
        //
        // Defining them here rather than as hand-written classes is what
        // makes `dark:` unnecessary at the call site and the opacity modifier
        // work. See the channel-triplet note above.
        content: {
          DEFAULT: 'rgb(var(--color-text-primary-channels) / <alpha-value>)',
          primary: 'rgb(var(--color-text-primary-channels) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary-channels) / <alpha-value>)',
          muted: 'rgb(var(--color-text-tertiary-channels) / <alpha-value>)',
        },
        edge: {
          DEFAULT: 'rgb(var(--color-border-channels) / <alpha-value>)',
          subtle: 'rgb(var(--color-border-channels) / <alpha-value>)',
          // Meaningful boundaries — input outlines, control edges. Clears the
          // 3:1 that WCAG 1.4.11 asks of UI component boundaries, which the
          // subtle border deliberately does not.
          strong: 'rgb(var(--color-border-strong-channels) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface-channels) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated-channels) / <alpha-value>)',
          // A four-step ladder, each rung lighter than the last in dark mode
          // and darker in light. `secondary` is the resting fill for plates,
          // chips and table headers; `hover` is deliberately one step further
          // so a hover state stays visible even on a `secondary` element.
          secondary: 'rgb(var(--color-surface-hover-channels) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-active-channels) / <alpha-value>)',
          // Numeric steps come from the PrimeNG-era neutral ramp in
          // styles/theme.scss, which is already per-theme. Those are plain hex
          // custom properties rather than channel triplets, so the opacity
          // modifier does NOT work on these steps — no call site uses one.
          50: 'var(--surface-50)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
          300: 'var(--surface-300)',
          400: 'var(--surface-400)',
          500: 'var(--surface-500)',
          600: 'var(--surface-600)',
          700: 'var(--surface-700)',
          800: 'var(--surface-800)',
          900: 'var(--surface-900)',
        },

        // Import default Tailwind colors for industry gradients
        blue: colors.blue,
        indigo: colors.indigo,
        green: colors.green,
        // teal: see the Brand Color Aliases block below — the ramp is merged there
        cyan: colors.cyan,
        purple: colors.purple,
        orange: colors.orange,
        red: colors.red,
        emerald: colors.emerald,

        // Brand Colors from Roaya Logo
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#3D5A80', // Primary Navy
          600: '#334d6e',
          700: '#2a3f5f',
          800: '#203047',
          900: '#192532',
          950: '#0f1a28',
        },
        secondary: {
          50: '#f0fafb',
          100: '#d9f2f5',
          200: '#b3e5eb',
          300: '#8dd8e0',
          400: '#71c7d1',
          500: '#5DB7C2', // Secondary Teal
          600: '#4a9ca6',
          700: '#3c7f87',
          800: '#2e6169',
          900: '#1f424a',
          950: '#142d32',
        },
        accent: {
          50: '#f5f2f9',
          100: '#e8e0f1',
          200: '#d1c1e3',
          300: '#b9a2d5',
          400: '#9278bc',
          500: '#6B4C9A', // Accent Purple
          600: '#5a3f82',
          700: '#49336a',
          800: '#382652',
          900: '#271a3a',
          950: '#1a1127',
        },
        // Neutral palette for UI elements
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // WorldPosta Brand Colors
        worldposta: {
          green: '#679A41',
          'green-dark': '#4a7a2e',
          'green-light': '#8bc166',
          navy: '#293C51',
          blue: '#4A90D9',
          purple: '#7C5BB2',
        },
        // Brand Color Aliases
        navy: '#3D5A80',
        // `teal` was declared twice in this object — once as `colors.teal`
        // above and again here as the flat brand hex. The later key wins, so
        // the imported ramp was discarded and every `teal-{step}` utility
        // (~50 call sites: text-teal-400, from-teal-500, border-teal-500/20,
        // shadow-teal-500/10 …) compiled to nothing. Keeping the ramp with the
        // brand hex as DEFAULT preserves both `text-teal` and `text-teal-400`.
        teal: { ...colors.teal, DEFAULT: '#5DB7C2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Tajawal', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Fluid typography
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.16' }],
        '6xl': ['3.75rem', { lineHeight: '1.16' }],
        '7xl': ['4.5rem', { lineHeight: '1.16' }],
        '8xl': ['6rem', { lineHeight: '1.16' }],
        '9xl': ['8rem', { lineHeight: '1.16' }],
      },
      spacing: {
        // Additional spacing for precise control
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // ------------------------------------------------------------------
        // Theme-driven elevation
        // ------------------------------------------------------------------
        // Tailwind's stock shadows are fixed black at light-mode alpha, so on
        // the #0F1B2A dark ground `shadow-lg` was effectively invisible on the
        // 250+ elements that use it. Reading the theme tokens instead means one
        // class carries the right depth in both modes.
        //
        // The token names sit one step below Tailwind's, which is why the
        // mapping looks offset: --shadow-xs holds Tailwind's `shadow-sm` value
        // and --shadow-sm holds its default `shadow`. Mapped this way, light
        // mode renders identically to the stock scale and only dark mode
        // changes.
        'sm': 'var(--shadow-xs)',
        DEFAULT: 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'hard': 'var(--shadow-hard)',
        'brand': 'var(--shadow-brand)',
        // Card stack shadows
        'card-sm': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-md': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'card-xl': '0 20px 50px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
        'card-active': '0 25px 60px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #6B4C9A 0%, #5DB7C2 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        // Mobile
        'xs': '375px',       // iPhone SE, small phones
        'sm': '430px',       // iPhone Pro Max, large phones

        // Tablet
        'md': '768px',       // iPad portrait
        'lg': '1024px',      // iPad Pro landscape

        // Laptop (THE CRITICAL ZONE)
        'laptop': '1280px',      // MacBook Air 13", standard laptops
        'laptop-md': '1366px',   // Most common Windows resolution
        'laptop-lg': '1440px',   // MacBook Pro 15", Dell XPS 15
        'laptop-xl': '1536px',   // Surface Laptop, Windows high-DPI

        // Desktop
        'desktop': '1600px',     // Standard external monitors
        'desktop-lg': '1920px',  // Full HD monitors
        'desktop-xl': '2560px',  // 2K/Ultrawide monitors
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        xs: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
        lg: '2rem',
        laptop: '2.5rem',
        'laptop-md': '3rem',
        'laptop-lg': '3.5rem',
        'laptop-xl': '4rem',
        desktop: '5rem',
        'desktop-lg': '6rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
}
