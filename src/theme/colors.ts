/**
 * Premium Bento-Box color system for Delhi Metro Clean.
 * Features adaptive light/dark themes with sophisticated metro line colors.
 */

export const lightPalette = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F0F2F5',

  // Text
  onBackground: '#1A1A1A',
  onSurface: '#2C2C2C',
  onSurfaceVariant: '#6B7280',

  // Premium Metro Lines - Soft/Pastel variations
  yellow_line: '#F4D35E',      // Soft Amber
  yellow_line_muted: '#FBE5A8',

  blue_line: '#7DD3C0',        // Pastel Cerulean/Teal
  blue_line_muted: '#C6EFDD',

  red_line: '#EF9A9A',         // Soft Rose
  red_line_muted: '#F8CECB',

  green_line: '#A5D6A7',       // Soft Green
  green_line_muted: '#D5E8D4',

  pink_line: '#F8BBD0',        // Soft Pink
  pink_line_muted: '#FCE4EC',

  purple_line: '#CE93D8',      // Soft Purple
  purple_line_muted: '#F3E5F5',

  orange_line: '#FFB74D',      // Soft Orange
  orange_line_muted: '#FFE0B2',

  brown_line: '#A1887F',       // Soft Brown
  brown_line_muted: '#D7CCC8',

  // Semantic colors
  primary: '#7DD3C0',          // Teal primary
  success: '#81C784',          // Soft green
  warning: '#FFB74D',          // Soft orange
  error: '#EF9A9A',            // Soft rose
  info: '#64B5F6',             // Soft blue

  // Component backgrounds
  elevation: {
    level1: '#FFFFFF',
    level2: '#F8F9FA',
    level3: '#F0F2F5',
  },

  // Shadows (subtle for light mode)
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const darkPalette = {
  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceVariant: '#242424',

  // Text
  onBackground: '#F5F5F5',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#B0B0B0',

  // Premium Metro Lines - Vivid/Neon variations
  yellow_line: '#FFE500',      // Glowing Gold/Neon Yellow
  yellow_line_muted: '#FFED4E',

  blue_line: '#00D9FF',        // Vivid Cyan/Neon Blue
  blue_line_muted: '#66E6FF',

  red_line: '#FF4757',         // Bright Magenta/Vivid Red
  red_line_muted: '#FF7A8A',

  green_line: '#2ED573',       // Vivid Green/Neon Lime
  green_line_muted: '#85FF7F',

  pink_line: '#FF1493',        // Deep Pink/Hot Magenta
  pink_line_muted: '#FF6EC7',

  purple_line: '#A945D9',      // Vivid Purple/Neon Violet
  purple_line_muted: '#D699F9',

  orange_line: '#FF7F3F',      // Vivid Orange/Neon Orange
  orange_line_muted: '#FF9E64',

  brown_line: '#8B7355',       // Glowing Brown
  brown_line_muted: '#B8956A',

  // Semantic colors
  primary: '#00D9FF',          // Neon Cyan primary
  success: '#2ED573',          // Neon Green
  warning: '#FF7F3F',          // Neon Orange
  error: '#FF4757',            // Neon Red
  info: '#00D9FF',             // Neon Cyan

  // Component backgrounds (subtle hierarchy)
  elevation: {
    level1: '#1A1A1A',
    level2: '#242424',
    level3: '#2E2E2E',
  },

  // No shadows in dark mode (rely on color hierarchy)
  shadow: 'transparent',
};

// Map line codes to colors
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
