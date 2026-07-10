import { createContext, useContext, useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isDynamicThemeSupported,
  useMaterial3Theme,
} from '@pchmn/expo-material3-theme';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  type MD3Theme,
} from 'react-native-paper';
import { typography, fontFamily } from './typography';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { lightPalette, darkPalette, bentoShadows, bentoGradients, type ShadowStyle } from './colors';
import { palettes, getPalette, DEFAULT_PALETTE_ID, type PaletteDefinition } from './palettes';

const FALLBACK_SOURCE_COLOR = '#BEFF6C'; // Neon lime green primary
const THEME_STORAGE_KEY = '@app_theme_mode';
const PALETTE_STORAGE_KEY = '@app_color_palette';

export type ThemeMode = 'system' | 'light' | 'dark';

function createPaperTheme(
  isDark: boolean,
  scheme: Partial<MD3Theme['colors']>,
): MD3Theme {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...scheme,
    },
  };
}

// ──────── Build Paper theme from palette ────────

function buildPaperColors(palette: PaletteDefinition, isDark: boolean): Partial<MD3Theme['colors']> {
  const p = isDark ? palette.dark : palette.light;
  const basePalette = isDark ? darkPalette : lightPalette;

  return {
    primary: p.primary,
    onPrimary: p.onPrimary,
    primaryContainer: p.primaryMuted,
    onPrimaryContainer: p.primary,
    secondary: p.accent,
    onSecondary: p.onPrimary,
    secondaryContainer: p.primaryMuted,
    onSecondaryContainer: p.accent,
    error: p.error,
    onError: p.onPrimary,
    errorContainer: isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2',
    onErrorContainer: p.error,
    background: p.background,
    onBackground: p.onBackground,
    surface: p.surface,
    onSurface: p.onSurface,
    surfaceVariant: p.surfaceVariant,
    onSurfaceVariant: p.onSurfaceVariant,
    outline: p.onSurfaceVariant,
    outlineVariant: p.surfaceVariant,
    elevation: {
      level0: 'transparent',
      level1: p.surface,
      level2: p.surfaceVariant,
      level3: isDark ? '#21242D' : '#E2E8F0',
      level4: isDark ? '#2B2F3A' : '#CBD5E1',
      level5: isDark ? '#363A47' : '#94A3B8',
    },
  };
}

// ──────── Semantic colors and premium metro lines ────────

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  interchange: string;
  warningContainer: string;
  successContainer: string;
  yellow_line: string;
  blue_line: string;
  red_line: string;
  green_line: string;
  pink_line: string;
  purple_line: string;
  orange_line: string;
  brown_line: string;
}

// ──────── New glassmorphism types ────────

export interface ThemeGradients {
  /** Full-screen background gradient stops */
  background: readonly string[];
  /** Glass card overlay gradient */
  card: readonly string[];
  /** CTA button gradient (primary → accent) */
  cta: readonly string[];
}

export interface ThemeShadows {
  soft: ShadowStyle;
  medium: ShadowStyle;
  heavy: ShadowStyle;
}

export interface ThemeFonts {
  heading: string;
  headingSemiBold: string;
  headingMedium: string;
  headingRegular: string;
  body: string;
  bodyMedium: string;
  bodySemiBold: string;
  bodyBold: string;
}

interface AppTheme {
  paperTheme: MD3Theme;
  navTheme: NavigationTheme;
  isDark: boolean;
  semantic: SemanticColors;
  /** Gradient stop arrays derived from the active palette */
  gradients: ThemeGradients;
  /** 3-tier shadow system (soft / medium / heavy) */
  shadows: ThemeShadows;
  /** Font family map (heading = Acorn, body = Inter) */
  fonts: ThemeFonts;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorPaletteId: string;
  setColorPalette: (id: string) => void;
}

function buildSemantic(palette: PaletteDefinition, isDark: boolean): SemanticColors {
  const p = isDark ? palette.dark : palette.light;
  const basePalette = isDark ? darkPalette : lightPalette;

  return {
    success: p.success,
    warning: p.warning,
    error: p.error,
    info: p.info,
    interchange: p.warning,
    warningContainer: isDark ? basePalette.warningContainer : '#FEF3C7',
    successContainer: isDark ? basePalette.successContainer : '#D1FAE5',
    yellow_line: basePalette.yellow_line,
    blue_line: basePalette.blue_line,
    red_line: basePalette.red_line,
    green_line: basePalette.green_line,
    pink_line: basePalette.pink_line,
    purple_line: basePalette.purple_line,
    orange_line: basePalette.orange_line,
    brown_line: basePalette.brown_line,
  };
}

function buildGradients(palette: PaletteDefinition, isDark: boolean): ThemeGradients {
  const p = isDark ? palette.dark : palette.light;
  return {
    background: isDark ? palette.gradientStops.dark : palette.gradientStops.light,
    card: isDark ? bentoGradients.glassDark : bentoGradients.glassLight,
    cta: [p.primary, p.accent],
  };
}

function buildShadows(isDark: boolean): ThemeShadows {
  const tier = isDark ? bentoShadows.dark : bentoShadows.light;
  return {
    soft: tier.soft,
    medium: tier.medium,
    heavy: tier.heavy,
  };
}

const defaultFonts: ThemeFonts = {
  heading: fontFamily.heading,
  headingSemiBold: fontFamily.headingSemiBold,
  headingMedium: fontFamily.headingMedium,
  headingRegular: fontFamily.headingRegular,
  body: fontFamily.body,
  bodyMedium: fontFamily.bodyMedium,
  bodySemiBold: fontFamily.bodySemiBold,
  bodyBold: fontFamily.bodyBold,
};

const ThemeContext = createContext<AppTheme>({
  paperTheme: MD3LightTheme,
  navTheme: NavigationDefaultTheme,
  isDark: false,
  semantic: {} as SemanticColors,
  gradients: {
    background: bentoGradients.backgroundLight,
    card: bentoGradients.glassLight,
    cta: ['#16A34A', '#0D9488'],
  },
  shadows: bentoShadows.light,
  fonts: defaultFonts,
  themeMode: 'system',
  setThemeMode: () => {},
  colorPaletteId: DEFAULT_PALETTE_ID,
  setColorPalette: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const { theme: materialTheme } = useMaterial3Theme({
    fallbackSourceColor: FALLBACK_SOURCE_COLOR,
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorPaletteId, setColorPaletteIdState] = useState<string>(DEFAULT_PALETTE_ID);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(PALETTE_STORAGE_KEY),
    ]).then(([mode, paletteId]) => {
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        setThemeModeState(mode as ThemeMode);
      }
      if (paletteId && palettes.some((p) => p.id === paletteId)) {
        setColorPaletteIdState(paletteId);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const setColorPalette = useCallback((id: string) => {
    setColorPaletteIdState(id);
    AsyncStorage.setItem(PALETTE_STORAGE_KEY, id).catch(() => {});
  }, []);

  const value = useMemo<AppTheme>(() => {
    const isDark = themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');
    const palette = getPalette(colorPaletteId);

    const paperColors = buildPaperColors(palette, isDark);
    const paperTheme = createPaperTheme(isDark, paperColors);

    const { LightTheme: navLight, DarkTheme: navDark } = adaptNavigationTheme({
      reactNavigationLight: NavigationDefaultTheme,
      reactNavigationDark: NavigationDarkTheme,
      materialLight: createPaperTheme(false, buildPaperColors(palette, false)),
      materialDark: createPaperTheme(true, buildPaperColors(palette, true)),
    });

    const p = isDark ? palette.dark : palette.light;

    const navTheme: NavigationTheme = isDark
      ? {
          ...navDark,
          colors: {
            ...navDark.colors,
            background: p.background,
            card: p.surface,
            text: p.onSurface,
            border: p.surfaceVariant,
            primary: p.primary,
          },
        }
      : {
          ...navLight,
          colors: {
            ...navLight.colors,
            background: p.background,
            card: p.surface,
            text: p.onSurface,
            border: p.surfaceVariant,
            primary: p.primary,
          },
        };

    return {
      paperTheme,
      navTheme,
      isDark,
      semantic: buildSemantic(palette, isDark),
      gradients: buildGradients(palette, isDark),
      shadows: buildShadows(isDark),
      fonts: defaultFonts,
      themeMode,
      setThemeMode,
      colorPaletteId,
      setColorPalette,
    };
  }, [scheme, themeMode, colorPaletteId, setThemeMode, setColorPalette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export const themeRuntimeConfig = {
  fallbackSourceColor: FALLBACK_SOURCE_COLOR,
} as const;

// Re-export the old static themes for backward compatibility
export { palettes, getPalette };
export const paperLightTheme = MD3LightTheme;
export const paperDarkTheme = MD3DarkTheme;
