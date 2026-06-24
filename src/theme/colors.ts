/**
 * Premium Bento-Box color system for Delhi Metro Clean.
 *
 * Light mode  — forest green and crisp white
 * Dark mode   — near-black base, neon lime green primary
 *
 * Inspired by modern bento-grid app designs with color-blocked
 * cards, bold metric typography, and floating glass navigation.
 */

/* ───────── Border Radius Tokens ───────── */
export const bentoRadius = {
  card: 24,
  large: 28,
  heroCard: 32,
  pill: 40,
  button: 20,
  icon: 16,
  badge: 14,
  small: 12,
} as const;

/* ───────── Shadow Tokens ───────── */
import { Platform } from 'react-native';

export const bentoShadows = {
  light: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
  dark: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
};

/* ───────── Light Palette ───────── */
export const lightPalette = {
  // Backgrounds — crisp white on cool gray for card separation
  background: '#F8FAFC',   // Cool off-white — easy on eyes
  surface: '#FFFFFF',      // Pure white cards for maximum contrast
  surfaceVariant: '#F1F5F9', // Subtle cool-gray tint

  // Text — deeper, richer
  onBackground: '#0F172A',
  onSurface: '#1E293B',
  onSurfaceVariant: '#64748B',

  // Premium Metro Lines
  yellow_line: '#F59E0B',
  yellow_line_muted: '#FEF3C7',
  yellow_line_bg: 'rgba(245,158,11,0.15)',

  blue_line: '#3B82F6',
  blue_line_muted: '#DBEAFE',
  blue_line_bg: 'rgba(59,130,246,0.15)',

  red_line: '#EF4444',
  red_line_muted: '#FEE2E2',
  red_line_bg: 'rgba(239,68,68,0.15)',

  green_line: '#10B981',
  green_line_muted: '#D1FAE5',
  green_line_bg: 'rgba(16,185,129,0.15)',

  pink_line: '#EC4899',
  pink_line_muted: '#FCE7F3',
  pink_line_bg: 'rgba(236,72,153,0.15)',

  purple_line: '#8B5CF6',
  purple_line_muted: '#EDE9FE',
  purple_line_bg: 'rgba(139,92,246,0.15)',

  orange_line: '#F97316',
  orange_line_muted: '#FFEDD5',
  orange_line_bg: 'rgba(249,115,22,0.15)',

  brown_line: '#78350F',
  brown_line_muted: '#FEF3C7',
  brown_line_bg: 'rgba(120,53,15,0.15)',

  aqua_line: '#00B5B5',
  aqua_line_muted: '#CCF0F0',
  aqua_line_bg: 'rgba(0,181,181,0.15)',

  // Semantic
  primary: '#16A34A',            // Richer, deeper green
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  interchange: '#D97706',
  warningContainer: '#FEF3C7',
  successContainer: '#D1FAE5',

  // Component surface elevations — subtle depth
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#F8FAFC',
    level3: '#F1F5F9',
    level4: '#E2E8F0',
    level5: '#CBD5E1',
  },

  // Warm card shadow
  shadow: 'rgba(15,23,42,0.04)',
};

/* ───────── Dark Palette ───────── */
export const darkPalette = {
  // Backgrounds — near black
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceVariant: '#242424',

  // Text
  onBackground: '#F9FAFB',
  onSurface: '#F3F4F6',
  onSurfaceVariant: '#9CA3AF',

  // Premium Metro Lines
  yellow_line: '#FFD700',
  yellow_line_muted: 'rgba(255,215,0,0.20)',
  yellow_line_bg: 'rgba(255,215,0,0.12)',

  blue_line: '#3B82F6',
  blue_line_muted: 'rgba(59,130,246,0.20)',
  blue_line_bg: 'rgba(59,130,246,0.12)',

  red_line: '#FF4D4D',
  red_line_muted: 'rgba(255,77,77,0.20)',
  red_line_bg: 'rgba(255,77,77,0.12)',

  green_line: '#BEFF6C',
  green_line_muted: 'rgba(190,255,108,0.20)',
  green_line_bg: 'rgba(190,255,108,0.12)',

  pink_line: '#FF6B9D',
  pink_line_muted: 'rgba(255,107,157,0.20)',
  pink_line_bg: 'rgba(255,107,157,0.12)',

  purple_line: '#B388FF',
  purple_line_muted: 'rgba(179,136,255,0.20)',
  purple_line_bg: 'rgba(179,136,255,0.12)',

  orange_line: '#FF9100',
  orange_line_muted: 'rgba(255,145,0,0.20)',
  orange_line_bg: 'rgba(255,145,0,0.12)',

  brown_line: '#A1887F',
  brown_line_muted: 'rgba(161,136,127,0.20)',
  brown_line_bg: 'rgba(161,136,127,0.12)',

  aqua_line: '#00D1D1',
  aqua_line_muted: 'rgba(0,209,209,0.20)',
  aqua_line_bg: 'rgba(0,209,209,0.12)',

  // Semantic
  primary: '#BEFF6C',            // Neon Lime Green
  success: '#BEFF6C',
  warning: '#FFD700',            // Gold
  error: '#FF4D4D',
  info: '#3B82F6',
  interchange: '#FFD700',
  warningContainer: 'rgba(255,215,0,0.15)',
  successContainer: 'rgba(190,255,108,0.15)',

  // Component surface elevations (color hierarchy, no shadows)
  elevation: {
    level0: 'transparent',
    level1: '#1A1A1A',
    level2: '#242424',
    level3: '#2E2E2E',
    level4: '#383838',
    level5: '#424242',
  },

  // No shadows in dark mode
  shadow: 'transparent',
};

/* ───────── Line Code → Color Map ───────── */
export const lineColorMap = {
  light: {
    'Yellow': lightPalette.yellow_line,
    'YL': lightPalette.yellow_line,
    'Blue': lightPalette.blue_line,
    'BL': lightPalette.blue_line,
    'Red': lightPalette.red_line,
    'RL': lightPalette.red_line,
    'Green': lightPalette.green_line,
    'GL': lightPalette.green_line,
    'Pink': lightPalette.pink_line,
    'PL': lightPalette.pink_line,
    'Purple': lightPalette.purple_line,
    'VI': lightPalette.purple_line,
    'Orange': lightPalette.orange_line,
    'OL': lightPalette.orange_line,
    'Brown': lightPalette.brown_line,
    'BR': lightPalette.brown_line,
    'Aqua': lightPalette.aqua_line,
    'AQ': lightPalette.aqua_line,
  },
  dark: {
    'Yellow': darkPalette.yellow_line,
    'YL': darkPalette.yellow_line,
    'Blue': darkPalette.blue_line,
    'BL': darkPalette.blue_line,
    'Red': darkPalette.red_line,
    'RL': darkPalette.red_line,
    'Green': darkPalette.green_line,
    'GL': darkPalette.green_line,
    'Pink': darkPalette.pink_line,
    'PL': darkPalette.pink_line,
    'Purple': darkPalette.purple_line,
    'VI': darkPalette.purple_line,
    'Orange': darkPalette.orange_line,
    'OL': darkPalette.orange_line,
    'Brown': darkPalette.brown_line,
    'BR': darkPalette.brown_line,
    'Aqua': darkPalette.aqua_line,
    'AQ': darkPalette.aqua_line,
  },
};
