/**
 * Premium Bento-Box color system for Delhi Metro Clean.
 *
 * Light mode  — warm cream surfaces, soft pastel metro lines
 * Dark mode   — deep blue-black base, vivid neon metro lines
 *
 * Inspired by modern bento-grid app designs with color-blocked
 * cards, bold metric typography, and floating glass navigation.
 */

/* ───────── Border Radius Tokens ───────── */
export const bentoRadius = {
  card: 24,
  heroCard: 32,
  pill: 40,
  button: 20,
  icon: 16,
  badge: 14,
  small: 12,
} as const;

/* ───────── Light Palette ───────── */
export const lightPalette = {
  // Backgrounds — warm cream, not clinical white
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F2EDE8',

  // Text
  onBackground: '#1A1A1A',
  onSurface: '#1C1C1E',
  onSurfaceVariant: '#6E6E73',

  // Premium Metro Lines — soft, curated pastels
  yellow_line: '#E8A838',        // Soft Amber Gold
  yellow_line_muted: '#FFF3D6',
  yellow_line_bg: 'rgba(232,168,56,0.10)',

  blue_line: '#5DADE2',          // Pastel Cerulean
  blue_line_muted: '#D6EAF8',
  blue_line_bg: 'rgba(93,173,226,0.10)',

  red_line: '#E57373',           // Soft Rose
  red_line_muted: '#FDDEDE',
  red_line_bg: 'rgba(229,115,115,0.10)',

  green_line: '#81C784',         // Sage Green
  green_line_muted: '#D5E8D4',
  green_line_bg: 'rgba(129,199,132,0.10)',

  pink_line: '#E991B2',          // Dusty Rose
  pink_line_muted: '#FCE4EC',
  pink_line_bg: 'rgba(233,145,178,0.10)',

  purple_line: '#B39DDB',        // Soft Lavender
  purple_line_muted: '#EDE7F6',
  purple_line_bg: 'rgba(179,157,219,0.10)',

  orange_line: '#F4A261',        // Warm Peach
  orange_line_muted: '#FFE6CC',
  orange_line_bg: 'rgba(244,162,97,0.10)',

  brown_line: '#A1887F',         // Warm Mocha
  brown_line_muted: '#D7CCC8',
  brown_line_bg: 'rgba(161,136,127,0.10)',

  // Semantic
  primary: '#5DADE2',            // Cerulean Blue primary
  success: '#66BB6A',
  warning: '#F4A261',
  error: '#EF5350',
  info: '#5DADE2',
  interchange: '#E8A838',        // Amber for interchange badges
  warningContainer: '#FFF3D6',
  successContainer: '#E8F5E9',

  // Component surface elevations
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#F8F5F1',
    level3: '#F2EDE8',
    level4: '#EDE7E0',
    level5: '#E8E1D9',
  },

  // Card shadow (soft light mode only)
  shadow: 'rgba(0, 0, 0, 0.06)',
};

/* ───────── Dark Palette ───────── */
export const darkPalette = {
  // Backgrounds — deep blue-black
  background: '#0A0A0F',
  surface: '#161620',
  surfaceVariant: '#1E1E2A',

  // Text
  onBackground: '#F5F5F7',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#A0A0B0',

  // Premium Metro Lines — vivid neon for dark backgrounds
  yellow_line: '#FFD700',        // Glowing Gold
  yellow_line_muted: 'rgba(255,215,0,0.20)',
  yellow_line_bg: 'rgba(255,215,0,0.12)',

  blue_line: '#00E5FF',          // Vivid Cyan
  blue_line_muted: 'rgba(0,229,255,0.20)',
  blue_line_bg: 'rgba(0,229,255,0.12)',

  red_line: '#FF5252',           // Vivid Red
  red_line_muted: 'rgba(255,82,82,0.20)',
  red_line_bg: 'rgba(255,82,82,0.12)',

  green_line: '#69F0AE',         // Neon Mint
  green_line_muted: 'rgba(105,240,174,0.20)',
  green_line_bg: 'rgba(105,240,174,0.12)',

  pink_line: '#FF4081',          // Hot Pink
  pink_line_muted: 'rgba(255,64,129,0.20)',
  pink_line_bg: 'rgba(255,64,129,0.12)',

  purple_line: '#B388FF',        // Neon Lavender
  purple_line_muted: 'rgba(179,136,255,0.20)',
  purple_line_bg: 'rgba(179,136,255,0.12)',

  orange_line: '#FF9100',        // Neon Orange
  orange_line_muted: 'rgba(255,145,0,0.20)',
  orange_line_bg: 'rgba(255,145,0,0.12)',

  brown_line: '#A1887F',         // Muted Mocha
  brown_line_muted: 'rgba(161,136,127,0.20)',
  brown_line_bg: 'rgba(161,136,127,0.12)',

  // Semantic
  primary: '#00E5FF',            // Neon Cyan primary
  success: '#69F0AE',
  warning: '#FF9100',
  error: '#FF5252',
  info: '#00E5FF',
  interchange: '#FFD700',
  warningContainer: 'rgba(255,215,0,0.15)',
  successContainer: 'rgba(105,240,174,0.15)',

  // Component surface elevations (color hierarchy, no shadows)
  elevation: {
    level0: 'transparent',
    level1: '#161620',
    level2: '#1E1E2A',
    level3: '#262636',
    level4: '#2E2E40',
    level5: '#36364A',
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
  },
};
