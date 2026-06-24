import AsyncStorage from '@react-native-async-storage/async-storage';
import { databases } from '../config/appwrite';
import { Query, ID } from 'react-native-appwrite';

export interface PortalThemeDefinition {
  $id?: string;
  name: string;
  emoji: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  onBackground: string;
  onSurface: string;
  isDark: boolean;
  isActive: boolean;
}

export const defaultPortalThemes: PortalThemeDefinition[] = [
  {
    $id: 'theme_classic_indigo',
    name: 'Classic Indigo',
    emoji: '💼',
    primary: '#6366F1',
    accent: '#4F46E5',
    background: '#FAFAFE',
    surface: '#FFFFFF',
    onBackground: '#1F2937',
    onSurface: '#111827',
    isDark: false,
    isActive: true,
  },
  {
    $id: 'theme_terminal_green',
    name: 'Terminal Green',
    emoji: '📟',
    primary: '#10B981',
    accent: '#059669',
    background: '#090A0F',
    surface: '#12131A',
    onBackground: '#E5E7EB',
    onSurface: '#F3F4F6',
    isDark: true,
    isActive: true,
  },
  {
    $id: 'theme_cyberpunk_neon',
    name: 'Cyberpunk Neon',
    emoji: '👾',
    primary: '#EC4899',
    accent: '#F59E0B',
    background: '#110C24',
    surface: '#1A1436',
    onBackground: '#F9FAFB',
    onSurface: '#FFFFFF',
    isDark: true,
    isActive: true,
  },
  {
    $id: 'theme_royal_sapphire',
    name: 'Royal Sapphire',
    emoji: '👑',
    primary: '#3B82F6',
    accent: '#8B5CF6',
    background: '#0B0F19',
    surface: '#141B2D',
    onBackground: '#F3F4F6',
    onSurface: '#FFFFFF',
    isDark: true,
    isActive: true,
  },
  {
    $id: 'theme_sunset_terracotta',
    name: 'Sunset Terracotta',
    emoji: '🌇',
    primary: '#F97316',
    accent: '#E11D48',
    background: '#FAFAF9',
    surface: '#FFFFFF',
    onBackground: '#292524',
    onSurface: '#1C1917',
    isDark: false,
    isActive: true,
  }
];

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'PortalThemes';
const THEME_STORAGE_KEY = '@app_admin_portal_themes';
const SELECTED_PORTAL_THEME_KEY = '@app_selected_portal_theme';

export const PortalThemeService = {
  // Get all active themes for developers
  async getThemes(): Promise<PortalThemeDefinition[]> {
    try {
      if (DATABASE_ID) {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('isActive', true)]
        );
        if (response.total > 0) {
          return response.documents as any;
        }
      }
    } catch (e) {
      console.warn('Appwrite PortalThemes fetch failed, using fallback storage:', e);
    }
    
    // Fallback to AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PortalThemeDefinition[];
        return parsed.filter(t => t.isActive);
      }
    } catch {}
    
    return defaultPortalThemes;
  },

  // Get all themes including inactive ones for Admin Dashboard
  async getAllThemes(): Promise<PortalThemeDefinition[]> {
    try {
      if (DATABASE_ID) {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        if (response.total > 0) {
          return response.documents as any;
        }
      }
    } catch (e) {
      console.warn('Appwrite PortalThemes fetch failed, using fallback storage:', e);
    }

    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    // First time initializing AsyncStorage with defaults
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(defaultPortalThemes));
    } catch {}
    return defaultPortalThemes;
  },

  // Save a theme (supports Appwrite and updates local AsyncStorage fallback)
  async saveTheme(theme: PortalThemeDefinition): Promise<void> {
    // 1. Local fallback updates
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      let list = stored ? JSON.parse(stored) as PortalThemeDefinition[] : [...defaultPortalThemes];
      
      if (theme.$id) {
        // Edit
        list = list.map(t => (t.$id === theme.$id || t.name === theme.name) ? theme : t);
      } else {
        // Create new
        const newTheme = { ...theme, $id: ID.unique() };
        list.push(newTheme);
        theme.$id = newTheme.$id;
      }
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('AsyncStorage theme save failed', e);
    }

    // 2. Appwrite updates (if configured)
    if (DATABASE_ID) {
      try {
        if (theme.$id) {
          try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, theme.$id, {
              name: theme.name,
              emoji: theme.emoji,
              primary: theme.primary,
              accent: theme.accent,
              background: theme.background,
              surface: theme.surface,
              onBackground: theme.onBackground,
              onSurface: theme.onSurface,
              isDark: theme.isDark,
              isActive: theme.isActive,
            });
            return;
          } catch (updateErr: any) {
            // If document not found or collection exists, try creating
            if (updateErr.code === 404 || updateErr.message?.includes('not found')) {
              await databases.createDocument(DATABASE_ID, COLLECTION_ID, theme.$id, {
                name: theme.name,
                emoji: theme.emoji,
                primary: theme.primary,
                accent: theme.accent,
                background: theme.background,
                surface: theme.surface,
                onBackground: theme.onBackground,
                onSurface: theme.onSurface,
                isDark: theme.isDark,
                isActive: theme.isActive,
              });
              return;
            }
            throw updateErr;
          }
        }
      } catch (e) {
        console.warn('Appwrite saveTheme failed, but local storage succeeded:', e);
      }
    }
  },

  // Delete a theme
  async deleteTheme(id: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        let list = JSON.parse(stored) as PortalThemeDefinition[];
        list = list.filter(t => t.$id !== id);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {}

    if (DATABASE_ID) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      } catch (e) {
        console.warn('Appwrite deleteTheme failed:', e);
      }
    }
  },

  // Save selected portal theme for developer
  async getSelectedThemeName(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(SELECTED_PORTAL_THEME_KEY)) || 'Classic Indigo';
    } catch {
      return 'Classic Indigo';
    }
  },

  async saveSelectedThemeName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_PORTAL_THEME_KEY, name);
    } catch {}
  }
};
