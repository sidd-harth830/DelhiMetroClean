/**
 * Curated color palette presets for Metro Routes.
 *
 * Each palette defines both light and dark mode colors.
 * The user can switch between palettes in Settings.
 */

export interface PaletteColors {
  primary: string;
  primaryMuted: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface PaletteDefinition {
  id: string;
  name: string;
  emoji: string;
  light: PaletteColors & {
    background: string;
    surface: string;
    surfaceVariant: string;
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;
    onPrimary: string;
  };
  dark: PaletteColors & {
    background: string;
    surface: string;
    surfaceVariant: string;
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;
    onPrimary: string;
  };
}

/* ─────────── Palette Definitions ─────────── */

export const palettes: PaletteDefinition[] = [
  {
    id: 'metro_green',
    name: 'Metro Green',
    emoji: '🌿',
    light: {
      primary: '#16A34A',
      primaryMuted: 'rgba(22,163,74,0.12)',
      accent: '#059669',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      background: '#FAFBFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#BEFF6C',
      primaryMuted: 'rgba(190,255,108,0.12)',
      accent: '#34D399',
      success: '#BEFF6C',
      warning: '#FFD700',
      error: '#FF4D4D',
      info: '#3B82F6',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      surfaceVariant: '#242424',
      onBackground: '#F9FAFB',
      onSurface: '#F3F4F6',
      onSurfaceVariant: '#9CA3AF',
      onPrimary: '#0D0D0D',
    },
  },
  {
    id: 'arctic_blue',
    name: 'Arctic Blue',
    emoji: '🧊',
    light: {
      primary: '#0284C7',
      primaryMuted: 'rgba(2,132,199,0.10)',
      accent: '#0EA5E9',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#E0F2FE',
      onBackground: '#0C4A6E',
      onSurface: '#1E3A5F',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#38BDF8',
      primaryMuted: 'rgba(56,189,248,0.12)',
      accent: '#7DD3FC',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#38BDF8',
      background: '#0A1628',
      surface: '#132238',
      surfaceVariant: '#1E3450',
      onBackground: '#E0F2FE',
      onSurface: '#BAE6FD',
      onSurfaceVariant: '#7DD3FC',
      onPrimary: '#0A1628',
    },
  },
  {
    id: 'ember_red',
    name: 'Ember Red',
    emoji: '🔥',
    light: {
      primary: '#DC2626',
      primaryMuted: 'rgba(220,38,38,0.10)',
      accent: '#F97316',
      success: '#16A34A',
      warning: '#EA580C',
      error: '#B91C1C',
      info: '#2563EB',
      background: '#FFFBFA',
      surface: '#FFFFFF',
      surfaceVariant: '#FEF2F2',
      onBackground: '#1C1917',
      onSurface: '#292524',
      onSurfaceVariant: '#78716C',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#F87171',
      primaryMuted: 'rgba(248,113,113,0.12)',
      accent: '#FB923C',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#FCA5A5',
      info: '#60A5FA',
      background: '#1A0A0A',
      surface: '#2D1515',
      surfaceVariant: '#3D1F1F',
      onBackground: '#FEF2F2',
      onSurface: '#FECACA',
      onSurfaceVariant: '#F87171',
      onPrimary: '#1A0A0A',
    },
  },
  {
    id: 'violet_dream',
    name: 'Violet Dream',
    emoji: '💜',
    light: {
      primary: '#7C3AED',
      primaryMuted: 'rgba(124,58,237,0.10)',
      accent: '#A78BFA',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#6366F1',
      background: '#FAFAFE',
      surface: '#FFFFFF',
      surfaceVariant: '#F3F0FF',
      onBackground: '#1E1B4B',
      onSurface: '#312E81',
      onSurfaceVariant: '#6B7280',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#C4B5FD',
      primaryMuted: 'rgba(196,181,253,0.12)',
      accent: '#A78BFA',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#818CF8',
      background: '#0E0B1E',
      surface: '#1A1530',
      surfaceVariant: '#261F42',
      onBackground: '#F5F3FF',
      onSurface: '#E9E5FF',
      onSurfaceVariant: '#A78BFA',
      onPrimary: '#0E0B1E',
    },
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    emoji: '🌅',
    light: {
      primary: '#B45309',
      primaryMuted: 'rgba(180,83,9,0.10)',
      accent: '#D97706',
      success: '#15803D',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#0369A1',
      background: '#FFFDF7',
      surface: '#FFFFFF',
      surfaceVariant: '#FEF9EC',
      onBackground: '#1C1917',
      onSurface: '#292524',
      onSurfaceVariant: '#78716C',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#FCD34D',
      primaryMuted: 'rgba(252,211,77,0.12)',
      accent: '#FBBF24',
      success: '#4ADE80',
      warning: '#FCD34D',
      error: '#F87171',
      info: '#38BDF8',
      background: '#1A1208',
      surface: '#2D2010',
      surfaceVariant: '#3D2E18',
      onBackground: '#FEF9EC',
      onSurface: '#FDE68A',
      onSurfaceVariant: '#D4A843',
      onPrimary: '#1A1208',
    },
  },
  {
    id: 'midnight_teal',
    name: 'Midnight Teal',
    emoji: '🌊',
    light: {
      primary: '#0D9488',
      primaryMuted: 'rgba(13,148,136,0.10)',
      accent: '#14B8A6',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7',
      background: '#F8FDFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F0FDFA',
      onBackground: '#134E4A',
      onSurface: '#1E3A3A',
      onSurfaceVariant: '#5F7A7A',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#2DD4BF',
      primaryMuted: 'rgba(45,212,191,0.12)',
      accent: '#5EEAD4',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#38BDF8',
      background: '#0A1A1A',
      surface: '#122828',
      surfaceVariant: '#1C3838',
      onBackground: '#F0FDFA',
      onSurface: '#CCFBF1',
      onSurfaceVariant: '#5EEAD4',
      onPrimary: '#0A1A1A',
    },
  },
];

export const DEFAULT_PALETTE_ID = 'metro_green';

export function getPalette(id: string): PaletteDefinition {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}
