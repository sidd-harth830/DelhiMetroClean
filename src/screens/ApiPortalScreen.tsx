import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Text, Button, Surface, useTheme, IconButton } from 'react-native-paper';
import { ID, Query } from 'react-native-appwrite';
import { useAuth } from '../auth/AuthContext';
import { databases } from '../config/appwrite';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius, bentoShadows } from '../theme/colors';
import { PortalThemeService, PortalThemeDefinition, defaultPortalThemes } from '../theme/portalThemes';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'ApiKeys';

export function ApiPortalScreen() {
  const { user, loginWithGoogle } = useAuth();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const navigation = useNavigation<any>();

  // State
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usecase, setUsecase] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Theme state
  const [selectedTheme, setSelectedTheme] = useState<PortalThemeDefinition | null>(null);
  const [availableThemes, setAvailableThemes] = useState<PortalThemeDefinition[]>([]);

  const isAdmin = user?.email === 'leocarnivas@gmail.com';

  // Load themes and API status
  useEffect(() => {
    async function initPortal() {
      try {
        const activeThemes = await PortalThemeService.getThemes();
        setAvailableThemes(activeThemes);
        const savedName = await PortalThemeService.getSelectedThemeName();
        const current = activeThemes.find(t => t.name === savedName) || activeThemes[0] || defaultPortalThemes[0];
        setSelectedTheme(current);
      } catch (err) {
        console.warn('Failed to load themes', err);
      }

      if (user && user.email) {
        await checkApiStatus();
      } else {
        setLoading(false);
      }
    }
    initPortal();
  }, [user]);

  const checkApiStatus = async () => {
    try {
      setLoading(true);
      if (!DATABASE_ID) {
         console.warn("Appwrite Database ID missing");
         setLoading(false);
         return;
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', user!.$id),
          Query.limit(1)
        ]
      );

      if (response.total > 0) {
        const doc = response.documents[0];
        setRequestStatus(doc.status as any);
        if (doc.status === 'approved') {
          setApiKey(doc.apiKey);
        }
      } else {
        setRequestStatus('none');
      }
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!usecase.trim()) {
      Alert.alert('Required', 'Please describe your use case.');
      return;
    }

    try {
      setSubmitting(true);
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          userId: user!.$id,
          email: user!.email,
          status: 'pending',
          usecase: usecase.trim(),
          apiKey: null,
        }
      );
      setRequestStatus('pending');
      Alert.alert('Success', 'Your request has been submitted for admin approval.');
    } catch (error: any) {
      console.error('Request failed:', error);
      Alert.alert('Error', error.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    if (apiKey) {
      await Clipboard.setStringAsync(apiKey);
      Alert.alert('Copied', 'API Key copied to clipboard!');
    }
  };

  // Derive dynamic portal colors
  const colors = selectedTheme ? {
    primary: selectedTheme.primary,
    accent: selectedTheme.accent,
    background: selectedTheme.background,
    surface: selectedTheme.surface,
    onBackground: selectedTheme.onBackground,
    onSurface: selectedTheme.onSurface,
    onSurfaceVariant: selectedTheme.isDark ? '#94A3B8' : '#4B5563',
    cardBackground: selectedTheme.surface,
    divider: selectedTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  } : {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    onBackground: theme.colors.onBackground,
    onSurface: theme.colors.onSurface,
    onSurfaceVariant: theme.colors.onSurfaceVariant,
    cardBackground: theme.colors.elevation.level1,
    divider: theme.colors.outlineVariant,
  };

  if (!user || !user.email) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Ionicons name="code-slash-outline" size={80} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground }]}>Developer Portal</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Login to request access to the Premium Metro API.
          </Text>
          <Button
            mode="contained"
            onPress={loginWithGoogle}
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            textColor={selectedTheme?.isDark ? '#090A0C' : '#FFFFFF'}
            icon="google"
          >
            Sign in with Google
          </Button>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
            API Portal
          </Text>
          {isAdmin && (
            <Button
              mode="contained-tonal"
              onPress={() => navigation.navigate('AdminDashboard')}
              icon="shield-checkmark"
              compact
            >
              Admin Panel
            </Button>
          )}
        </View>

        {/* Dynamic theme switcher row */}
        {availableThemes.length > 1 && (
          <View style={[styles.themeRow, { borderColor: colors.divider }]}>
            <Text style={[styles.themeLabel, { color: colors.onSurfaceVariant }]}>Portal Style:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {availableThemes.map((item) => {
                const isActive = selectedTheme?.name === item.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={async () => {
                      setSelectedTheme(item);
                      await PortalThemeService.saveSelectedThemeName(item.name);
                    }}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: isActive ? item.primary : colors.cardBackground,
                        borderColor: isActive ? item.primary : colors.divider,
                        borderWidth: 1,
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? (item.isDark ? '#090A0C' : '#FFFFFF') : colors.onSurface }}>
                      {item.emoji} {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Surface style={[styles.card, isDark ? bentoShadows.dark.soft : bentoShadows.light.soft, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Metro Route Premium API</Text>
          <Text style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
            Get programmatic access to live Delhi and Noida Metro data, routes, and station details. 
            Currently available in closed beta.
          </Text>
        </Surface>

        {requestStatus === 'none' && (
          <Surface style={[styles.card, isDark ? bentoShadows.dark.soft : bentoShadows.light.soft, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Request Access</Text>
            <Text style={[styles.bodyText, { color: colors.onSurfaceVariant, marginBottom: 16 }]}>
              Please describe what you plan to build with our API. Our admin will review your request.
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: selectedTheme?.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: colors.onSurface,
                  borderColor: colors.divider,
                }
              ]}
              placeholder="e.g. A personal web dashboard for my commute..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              numberOfLines={4}
              value={usecase}
              onChangeText={setUsecase}
            />
            <Button
              mode="contained"
              loading={submitting}
              disabled={submitting}
              onPress={handleRequestAccess}
              style={{ marginTop: 16, backgroundColor: colors.primary }}
              textColor={selectedTheme?.isDark ? '#090A0C' : '#FFFFFF'}
            >
              Submit Request
            </Button>
          </Surface>
        )}

        {requestStatus === 'pending' && (
          <Surface style={[styles.card, styles.statusCard, { backgroundColor: selectedTheme?.isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={32} color={selectedTheme?.isDark ? '#FBBF24' : '#B45309'} />
            <Text style={[styles.cardTitle, { color: selectedTheme?.isDark ? '#FBBF24' : '#B45309', marginTop: 8 }]}>Review Pending</Text>
            <Text style={[styles.bodyText, { color: selectedTheme?.isDark ? '#FCD34D' : '#92400E', textAlign: 'center' }]}>
              Your request is currently being reviewed by an admin. Check back later!
            </Text>
          </Surface>
        )}

        {requestStatus === 'rejected' && (
          <Surface style={[styles.card, styles.statusCard, { backgroundColor: selectedTheme?.isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2' }]}>
            <Ionicons name="close-circle-outline" size={32} color={selectedTheme?.isDark ? '#F87171' : '#B91C1C'} />
            <Text style={[styles.cardTitle, { color: selectedTheme?.isDark ? '#F87171' : '#B91C1C', marginTop: 8 }]}>Access Denied</Text>
            <Text style={[styles.bodyText, { color: selectedTheme?.isDark ? '#FCA5A5' : '#991B1B', textAlign: 'center' }]}>
              Unfortunately, your request for API access was not approved at this time.
            </Text>
          </Surface>
        )}

        {requestStatus === 'approved' && apiKey && (
          <Surface style={[styles.card, isDark ? bentoShadows.dark.soft : bentoShadows.light.soft, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.approvedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.onSurface, marginLeft: 8 }]}>Access Granted</Text>
            </View>
            
            <Text style={[styles.bodyText, { color: colors.onSurfaceVariant, marginBottom: 16 }]}>
              You can now use the API. Include your key in the 'x-api-key' header.
            </Text>

            <View style={[
              styles.apiKeyBox, 
              { 
                backgroundColor: selectedTheme?.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                borderColor: colors.divider
              }
            ]}>
              <Text style={[styles.apiKeyText, { color: colors.onSurface }]} selectable>
                {apiKey}
              </Text>
              <IconButton
                icon="content-copy"
                iconColor={colors.primary}
                size={20}
                onPress={copyToClipboard}
              />
            </View>
          </Surface>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginBtn: {
    width: '100%',
    maxWidth: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: bentoRadius.pill,
  },
  card: {
    borderRadius: bentoRadius.large,
    padding: 20,
    marginBottom: 20,
  },
  statusCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 16,
  },
  apiKeyText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
});
