/**
 * Typography system for Delhi Metro Clean.
 *
 * Heading: Acorn (rounded geometric serif) — premium, distinctive
 * Body:    Inter (clean sans-serif) — highly legible at all sizes
 */

export const fontFamily = {
  /** Acorn — heading / display font */
  heading: 'Acorn-Bold',
  headingSemiBold: 'Acorn-SemiBold',
  headingMedium: 'Acorn-Medium',
  headingRegular: 'Acorn-Regular',

  /** Inter — body / UI font */
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',

  /** Monospace fallback */
  mono: 'monospace',
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    caption: 13,
    body: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    /** Hero display size */
    '5xl': 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
    /** Display/hero text tracking */
    display: -0.8,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    /** For large headings */
    display: 1.15,
  },
} as const;
