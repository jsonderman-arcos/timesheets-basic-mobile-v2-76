import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // You can also pull breakpoints from Core if desired:
    // screens: {
    //   sm: "640px", // or keep defaults
    //   md: "768px",
    //   lg: "1024px",
    //   xl: "1280px",
    // },
    extend: {
      /**
       * Map Tailwind colors directly to your Theme tokens.
       * These vars are defined in tokens.css with Light defaults,
       * and overridden inside .theme-dark / .theme-mobile.
       */
      colors: {
        // Base text tokens
        "text-primary": "var(--theme-base-text-primary)",
        "text-secondary": "var(--theme-base-text-secondary)",
        "text-default": "var(--theme-base-text-default)",
        "text-caption": "var(--theme-base-text-caption)",
        "text-disabled": "var(--theme-base-text-disabled)",

        // Base backgrounds (default + elevation levels)
        "background-default": "var(--theme-base-background-default)",
        "background-overlay": "var(--theme-base-background-overlay)",
        "background-paper-elevation-0": "var(--theme-base-background-paper-elevation-0)",
        "background-paper-elevation-1": "var(--theme-base-background-paper-elevation-1)",
        "background-paper-elevation-2": "var(--theme-base-background-paper-elevation-2)",
        "background-paper-elevation-3": "var(--theme-base-background-paper-elevation-3)",
        "background-paper-elevation-4": "var(--theme-base-background-paper-elevation-4)",

        // If you want to keep Lovable's semantic buckets, map them here:
        // These are examples; adjust to your preferred token pairing.
        border: "var(--theme-base-background-focus)",      // focus ring / borders
        input: "var(--theme-base-background-focus)",
        ring: "var(--theme-base-background-focus)",
        background: "var(--theme-base-background-default)",
        foreground: "var(--theme-base-text-primary)",

        primary: {
          DEFAULT: "var(--core-lighthouse-colors-brand-default-600)",
          foreground: "var(--core-lighthouse-colors-neutrals-white-100)",
          glow: "var(--core-lighthouse-colors-brand-default-600-alpha-50)",
        },
        secondary: {
          DEFAULT: "var(--core-lighthouse-colors-neutrals-neutral-300)",
          foreground: "var(--theme-base-text-primary)",
        },
        destructive: {
          DEFAULT: "var(--core-lighthouse-colors-reds-red-600)",
          foreground: "var(--core-lighthouse-colors-neutrals-white-100)",
        },
        muted: {
          DEFAULT: "var(--core-lighthouse-colors-neutrals-neutral-200)",
          foreground: "var(--theme-base-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--core-lighthouse-colors-blues-slate-blue-500)",
          foreground: "var(--core-lighthouse-colors-neutrals-white-100)",
        },
        success: {
          DEFAULT: "var(--core-lighthouse-colors-greens-soft-teal-darkly-300)",
          foreground: "var(--core-lighthouse-colors-neutrals-white-100)",
        },
        popover: {
          DEFAULT: "var(--theme-base-background-paper-elevation-1)",
          foreground: "var(--theme-base-text-primary)",
        },
        card: {
          DEFAULT: "var(--theme-base-background-paper-elevation-1)",
          foreground: "var(--theme-base-text-primary)",
        },
        sidebar: {
          DEFAULT: "var(--theme-base-background-paper-elevation-0)",
          foreground: "var(--theme-base-text-secondary)",
          primary: "var(--core-lighthouse-colors-brand-default-600)",
          "primary-foreground": "var(--core-lighthouse-colors-neutrals-white-100)",
          accent: "var(--core-lighthouse-colors-blues-slate-blue-500)",
          "accent-foreground": "var(--core-lighthouse-colors-neutrals-white-100)",
          border: "var(--theme-base-background-focus)",
          ring: "var(--theme-base-background-focus)",
        },
      },

      /**
       * Core radii, spacing, font sizes, opacity, z-index, and motions
       * all come straight from your Core tokens.
       */
      borderRadius: {
        // Map Lovable’s radius contract to Core primitives
        lg: "var(--core-radii-border-radius)",
        md: "calc(var(--core-radii-border-radius) - 2px)",
        sm: "calc(var(--core-radii-border-radius) - 4px)",
        // Optional: expose raw tokens too
        DEFAULT: "var(--core-radii-border-radius)",
        none: "var(--core-radii-border-radius-none)",
        max: "var(--core-radii-border-radius-max)",
      },

      spacing: {
        "3xs": "var(--core-spacing-spacing-3xs)",
        "2xs": "var(--core-spacing-spacing-2xs)",
        xs: "var(--core-spacing-spacing-xs)",
        sm: "var(--core-spacing-spacing-sm)",
        "sm-md": "var(--core-spacing-spacing-sm-md)",
        md: "var(--core-spacing-spacing-md)",
        lg: "var(--core-spacing-spacing-lg)",
        xl: "var(--core-spacing-spacing-xl)",
        "2xl": "var(--core-spacing-spacing-2xl)",
      },

      fontSize: {
        "2xs": "var(--core-lighthouse-typography-font-size-2xs)",
        xs: "var(--core-lighthouse-typography-font-size-xs)",
        sm: "var(--core-lighthouse-typography-font-size-sm)",
        base: "var(--core-lighthouse-typography-font-size-base)",
        md: "var(--core-lighthouse-typography-font-size-md)",
        lg: "var(--core-lighthouse-typography-font-size-lg)",
        xl: "var(--core-lighthouse-typography-font-size-xl)",
        "2xl": "var(--core-lighthouse-typography-font-size-2xl)",
        "3xl": "var(--core-lighthouse-typography-font-size-3xl)",
        "4xl": "var(--core-lighthouse-typography-font-size-4xl)",
        "5xl": "var(--core-lighthouse-typography-font-size-5xl)",
      },

      opacity: {
        hover: "var(--core-opacity-hover)",
        disabled: "var(--core-opacity-disabled)",
        overlay: "var(--core-opacity-overlay)",
      },

      zIndex: {
        dropdown: "var(--core-z-index-dropdown)",
        modal: "var(--core-z-index-modal)",
        tooltip: "var(--core-z-index-tooltip)",
      },

      transitionDuration: {
        fast: "var(--core-animation-duration-fast)",
        slow: "var(--core-animation-duration-slow)",
      },

      transitionTimingFunction: {
        standard: "var(--core-animation-easing-standard)",
        emphasized: "var(--core-animation-easing-emphasized)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;