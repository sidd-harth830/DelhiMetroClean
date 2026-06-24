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
      primaryMuted: 'rgba(22,163,74,0.08)',
      accent: '#0D9488',
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#BEFF6C',
      primaryMuted: 'rgba(190,255,108,0.1)',
      accent: '#34D399',
      success: '#BEFF6C',
      warning: '#FFD700',
      error: '#FF4D4D',
      info: '#3B82F6',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
  {
    id: 'arctic_blue',
    name: 'Arctic Blue',
    emoji: '🧊',
    light: {
      primary: '#2563EB',
      primaryMuted: 'rgba(37,99,235,0.08)',
      accent: '#0EA5E9',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#2563EB',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#60A5FA',
      primaryMuted: 'rgba(96,165,250,0.1)',
      accent: '#38BDF8',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
  {
    id: 'ember_red',
    name: 'Ember Red',
    emoji: '🔥',
    light: {
      primary: '#DC2626',
      primaryMuted: 'rgba(220,38,38,0.08)',
      accent: '#EA580C',
      success: '#16A34A',
      warning: '#EA580C',
      error: '#B91C1C',
      info: '#2563EB',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#F87171',
      primaryMuted: 'rgba(248,113,113,0.1)',
      accent: '#FB923C',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#FCA5A5',
      info: '#60A5FA',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
  {
    id: 'violet_dream',
    name: 'Violet Dream',
    emoji: '💜',
    light: {
      primary: '#7C3AED',
      primaryMuted: 'rgba(124,58,237,0.08)',
      accent: '#EC4899',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#6366F1',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#C4B5FD',
      primaryMuted: 'rgba(196,181,253,0.1)',
      accent: '#F472B6',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#818CF8',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    emoji: '🌅',
    light: {
      primary: '#B45309',
      primaryMuted: 'rgba(180,83,9,0.08)',
      accent: '#F97316',
      success: '#15803D',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#0369A1',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#FBBF24',
      primaryMuted: 'rgba(251,191,36,0.1)',
      accent: '#FB923C',
      success: '#4ADE80',
      warning: '#FCD34D',
      error: '#F87171',
      info: '#38BDF8',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
  {
    id: 'midnight_teal',
    name: 'Midnight Teal',
    emoji: '🌊',
    light: {
      primary: '#0D9488',
      primaryMuted: 'rgba(13,148,136,0.08)',
      accent: '#0284C7',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceVariant: '#F1F5F9',
      onBackground: '#0F172A',
      onSurface: '#1E293B',
      onSurfaceVariant: '#64748B',
      onPrimary: '#FFFFFF',
    },
    dark: {
      primary: '#2DD4BF',
      primaryMuted: 'rgba(45,212,191,0.1)',
      accent: '#38BDF8',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#38BDF8',
      background: '#090A0C',
      surface: '#15171C',
      surfaceVariant: '#21242D',
      onBackground: '#F8FAFC',
      onSurface: '#E2E8F0',
      onSurfaceVariant: '#94A3B8',
      onPrimary: '#090A0C',
    },
  },
];

export const DEFAULT_PALETTE_ID = 'metro_green';

export function getPalette(id: string): PaletteDefinition {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

