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
import { typography } from './typography';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { lightPalette, darkPalette } from './colors';

const FALLBACK_SOURCE_COLOR = '#BEFF6C'; // Neon lime green primary
const THEME_STORAGE_KEY = '@app_theme_mode';

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

// ──────── Paper themes with premium bento-box colors ────────

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightPalette.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: lightPalette.elevation.level3,
    onPrimaryContainer: lightPalette.onSurface,
    secondary: lightPalette.blue_line,
    onSecondary: '#FFFFFF',
    secondaryContainer: lightPalette.blue_line_muted,
    onSecondaryContainer: lightPalette.onSurface,
    error: lightPalette.error,
    onError: '#FFFFFF',
    errorContainer: lightPalette.red_line_muted,
    onErrorContainer: lightPalette.onSurface,
    background: lightPalette.background,
    onBackground: lightPalette.onBackground,
    surface: lightPalette.surface,
    onSurface: lightPalette.onSurface,
    surfaceVariant: lightPalette.surfaceVariant,
    onSurfaceVariant: lightPalette.onSurfaceVariant,
    outline: lightPalette.onSurfaceVariant,
    outlineVariant: lightPalette.surfaceVariant,
    elevation: lightPalette.elevation,
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkPalette.primary,
    onPrimary: '#000000',
    primaryContainer: darkPalette.elevation.level3,
    onPrimaryContainer: darkPalette.onSurface,
    secondary: darkPalette.blue_line,
    onSecondary: '#000000',
    secondaryContainer: darkPalette.elevation.level2,
    onSecondaryContainer: darkPalette.onSurface,
    error: darkPalette.error,
    onError: '#000000',
    errorContainer: darkPalette.elevation.level2,
    onErrorContainer: darkPalette.onSurface,
    background: darkPalette.background,
    onBackground: darkPalette.onBackground,
    surface: darkPalette.surface,
    onSurface: darkPalette.onSurface,
    surfaceVariant: darkPalette.surfaceVariant,
    onSurfaceVariant: darkPalette.onSurfaceVariant,
    outline: darkPalette.onSurfaceVariant,
    outlineVariant: darkPalette.surfaceVariant,
    elevation: darkPalette.elevation,
  },
};

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

interface AppTheme {
  paperTheme: MD3Theme;
  navTheme: NavigationTheme;
  isDark: boolean;
  semantic: SemanticColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const defaultSemanticLight: SemanticColors = {
  success: lightPalette.success,
  warning: lightPalette.warning,
  error: lightPalette.error,
  info: lightPalette.info,
  interchange: lightPalette.interchange,
  warningContainer: lightPalette.warningContainer,
  successContainer: lightPalette.successContainer,
  yellow_line: lightPalette.yellow_line,
  blue_line: lightPalette.blue_line,
  red_line: lightPalette.red_line,
  green_line: lightPalette.green_line,
  pink_line: lightPalette.pink_line,
  purple_line: lightPalette.purple_line,
  orange_line: lightPalette.orange_line,
  brown_line: lightPalette.brown_line,
};

const defaultSemanticDark: SemanticColors = {
  success: darkPalette.success,
  warning: darkPalette.warning,
  error: darkPalette.error,
  info: darkPalette.info,
  interchange: darkPalette.interchange,
  warningContainer: darkPalette.warningContainer,
  successContainer: darkPalette.successContainer,
  yellow_line: darkPalette.yellow_line,
  blue_line: darkPalette.blue_line,
  red_line: darkPalette.red_line,
  green_line: darkPalette.green_line,
  pink_line: darkPalette.pink_line,
  purple_line: darkPalette.purple_line,
  orange_line: darkPalette.orange_line,
  brown_line: darkPalette.brown_line,
};

const ThemeContext = createContext<AppTheme>({
  paperTheme: paperLightTheme,
  navTheme: NavigationDefaultTheme,
  isDark: false,
  semantic: defaultSemanticLight,
  themeMode: 'system',
  setThemeMode: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const { theme: materialTheme } = useMaterial3Theme({
    fallbackSourceColor: FALLBACK_SOURCE_COLOR,
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((mode) => {
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        setThemeModeState(mode as ThemeMode);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => { });
  }, []);

  const value = useMemo<AppTheme>(() => {
    const isDark = themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');

    // Use premium bento-box palettes
    const lightMaterialScheme: Partial<MD3Theme['colors']> = paperLightTheme.colors;
    const darkMaterialScheme: Partial<MD3Theme['colors']> = paperDarkTheme.colors;

    const materialLightTheme = createPaperTheme(false, lightMaterialScheme);
    const materialDarkTheme = createPaperTheme(true, darkMaterialScheme);

    const { LightTheme: navLight, DarkTheme: navDark } = adaptNavigationTheme({
      reactNavigationLight: NavigationDefaultTheme,
      reactNavigationDark: NavigationDarkTheme,
      materialLight: materialLightTheme,
      materialDark: materialDarkTheme,
    });

    const navigationLightTheme: NavigationTheme = {
      ...navLight,
      colors: {
        ...navLight.colors,
        background: lightPalette.background,
        card: lightPalette.surface,
        text: lightPalette.onSurface,
        border: lightPalette.surfaceVariant,
        primary: lightPalette.primary,
      },
    };

    const navigationDarkTheme: NavigationTheme = {
      ...navDark,
      colors: {
        ...navDark.colors,
        background: darkPalette.background,
        card: darkPalette.elevation.level2,
        text: darkPalette.onSurface,
        border: darkPalette.surfaceVariant,
        primary: darkPalette.primary,
      },
    };

    return {
      paperTheme: isDark ? materialDarkTheme : materialLightTheme,
      navTheme: isDark ? navigationDarkTheme : navigationLightTheme,
      isDark,
      semantic: isDark ? defaultSemanticDark : defaultSemanticLight,
      themeMode,
      setThemeMode,
    };
  }, [scheme, themeMode, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export const themeRuntimeConfig = {
  fallbackSourceColor: FALLBACK_SOURCE_COLOR,
} as const;
