import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, Switch, Pressable } from 'react-native';
import { Text, Surface, useTheme, Button, IconButton, TextInput, SegmentedButtons } from 'react-native-paper';
import { databases } from '../config/appwrite';
import { Query } from 'react-native-appwrite';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius, bentoShadows } from '../theme/colors';
import { PortalThemeService, PortalThemeDefinition, defaultPortalThemes } from '../theme/portalThemes';
import { GlassCard } from '../components/GlassCard';
import { GradientBackground } from '../components/GradientBackground';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'ApiKeys';

// Generate a secure looking API key
const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'mr_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

type ActiveTab = 'requests' | 'themes';

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { isDark, fonts } = useAppTheme();
  const navigation = useNavigation<any>();

  // Global state
  const [activeTab, setActiveTab] = useState<ActiveTab>('requests');
  const [loading, setLoading] = useState(true);

  // Tab 1: Requests state
  const [requests, setRequests] = useState<any[]>([]);

  // Tab 2: Themes state
  const [themes, setThemes] = useState<PortalThemeDefinition[]>([]);
  const [editingTheme, setEditingTheme] = useState<Partial<PortalThemeDefinition> | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('🎨');
  const [formPrimary, setFormPrimary] = useState('#6366F1');
  const [formAccent, setFormAccent] = useState('#4F46E5');
  const [formBackground, setFormBackground] = useState('#FAFAFE');
  const [formSurface, setFormSurface] = useState('#FFFFFF');
  const [formIsDark, setFormIsDark] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    if (user?.email !== 'leocarnivas@gmail.com') {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      navigation.goBack();
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'requests') {
      await fetchPendingRequests();
    } else {
      await fetchPortalThemes();
    }
    setLoading(false);
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('status', 'pending'),
          Query.orderDesc('$createdAt')
        ]
      );
      setRequests(response.documents);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      Alert.alert('Error', 'Failed to load requests.');
    }
  };

  const fetchPortalThemes = async () => {
    try {
      const allThemes = await PortalThemeService.getAllThemes();
      setThemes(allThemes);
    } catch (error) {
      console.error('Failed to fetch portal themes', error);
    }
  };

  const handleAction = async (docId: string, action: 'approved' | 'rejected') => {
    try {
      const data: any = { status: action };
      if (action === 'approved') {
        data.apiKey = generateApiKey();
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        docId,
        data
      );

      Alert.alert('Success', `Request has been ${action}.`);
      fetchPendingRequests(); // Refresh
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
      Alert.alert('Error', `Failed to ${action} request.`);
    }
  };

  // Theme Management handlers
  const handleToggleThemeActive = async (item: PortalThemeDefinition) => {
    try {
      const updated = { ...item, isActive: !item.isActive };
      await PortalThemeService.saveTheme(updated);
      fetchPortalThemes();
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme status.');
    }
  };

  const handleStartEditTheme = (item: PortalThemeDefinition | null) => {
    if (item) {
      setEditingTheme(item);
      setFormName(item.name);
      setFormEmoji(item.emoji);
      setFormPrimary(item.primary);
      setFormAccent(item.accent);
      setFormBackground(item.background);
      setFormSurface(item.surface);
      setFormIsDark(item.isDark);
      setFormIsActive(item.isActive);
    } else {
      setEditingTheme({});
      setFormName('');
      setFormEmoji('🎨');
      setFormPrimary('#6366F1');
      setFormAccent('#4F46E5');
      setFormBackground('#F8FAFC');
      setFormSurface('#FFFFFF');
      setFormIsDark(false);
      setFormIsActive(true);
    }
  };

  const handleSaveTheme = async () => {
    if (!formName.trim() || !formPrimary.trim() || !formAccent.trim() || !formBackground.trim() || !formSurface.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required color fields.');
      return;
    }

    try {
      const themeData: PortalThemeDefinition = {
        $id: editingTheme?.$id,
        name: formName.trim(),
        emoji: formEmoji.trim() || '🎨',
        primary: formPrimary.trim(),
        accent: formAccent.trim(),
        background: formBackground.trim(),
        surface: formSurface.trim(),
        onBackground: formIsDark ? '#F8FAFC' : '#1F2937',
        onSurface: formIsDark ? '#FFFFFF' : '#111827',
        isDark: formIsDark,
        isActive: formIsActive,
      };

      await PortalThemeService.saveTheme(themeData);
      Alert.alert('Success', 'Developer Portal theme saved successfully.');
      setEditingTheme(null);
      fetchPortalThemes();
    } catch (error) {
      console.error('Failed to save theme', error);
      Alert.alert('Error', 'Failed to save theme.');
    }
  };

  const handleDeleteTheme = (item: PortalThemeDefinition) => {
    if (!item.$id) return;
    Alert.alert(
      'Delete Theme',
      `Are you sure you want to delete theme "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PortalThemeService.deleteTheme(item.$id!);
              fetchPortalThemes();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete theme.');
            }
          }
        }
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <GlassCard padding={16} borderRadius={bentoRadius.large} style={styles.card}>
      <Text style={[styles.email, { color: theme.colors.onSurface, fontFamily: fonts.heading }]}>{item.email}</Text>
      <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
        Requested: {new Date(item.$createdAt).toLocaleDateString()}
      </Text>

      <View style={[styles.usecaseBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Text style={[styles.usecaseLabel, { color: theme.colors.onSurfaceVariant }]}>Use Case:</Text>
        <Text style={{ color: theme.colors.onSurface }}>{item.usecase}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          textColor={theme.colors.error}
          style={[styles.actionBtn, { borderColor: theme.colors.error }]}
          onPress={() => handleAction(item.$id, 'rejected')}
        >
          Reject
        </Button>
        <Button
          mode="contained"
          style={styles.actionBtn}
          onPress={() => handleAction(item.$id, 'approved')}
        >
          Approve
        </Button>
      </View>
    </GlassCard>
  );

  const renderThemeItem = ({ item }: { item: PortalThemeDefinition }) => {
    const isSystemTheme = defaultPortalThemes.some(t => t.$id === item.$id);
    return (
      <GlassCard padding={16} borderRadius={bentoRadius.large} style={styles.card}>
        <View style={styles.themeHeaderRow}>
          <View style={styles.themeInfoCol}>
            <Text style={[styles.email, { color: theme.colors.onSurface, fontFamily: fonts.heading }]}>
              {item.emoji} {item.name}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
              Mode: {item.isDark ? 'Dark 🌙' : 'Light ☀️'}
            </Text>
          </View>
          <View style={styles.themeToggleRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginRight: 4 }}>Active</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggleThemeActive(item)}
            />
          </View>
        </View>

        <View style={styles.colorPaletteRow}>
          <View style={[styles.colorDot, { backgroundColor: item.primary }]} />
          <Text style={styles.colorLabel}>Primary: {item.primary}</Text>
          <View style={[styles.colorDot, { backgroundColor: item.accent }]} />
          <Text style={styles.colorLabel}>Accent: {item.accent}</Text>
        </View>

        <View style={styles.themeButtonsRow}>
          {!isSystemTheme && (
            <IconButton
              icon="delete-outline"
              iconColor={theme.colors.error}
              onPress={() => handleDeleteTheme(item)}
            />
          )}
          <Button
            mode="contained-tonal"
            icon="pencil"
            onPress={() => handleStartEditTheme(item)}
            style={{ marginLeft: 'auto' }}
          >
            Edit
          </Button>
        </View>
      </GlassCard>
    );
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }]}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { fontFamily: fonts.heading, color: theme.colors.onSurface }]}>Admin Dashboard</Text>
        <IconButton icon="refresh" onPress={loadData} />
      </View>

      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ActiveTab)}
          buttons={[
            { value: 'requests', label: 'Key Requests' },
            { value: 'themes', label: 'Portal Themes' }
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {editingTheme ? (
        <ScrollView style={styles.editForm} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: fonts.heading }]}>{editingTheme.$id ? 'Edit Portal Theme' : 'Create Custom Theme'}</Text>
          
          <TextInput
            label="Theme Name"
            value={formName}
            onChangeText={setFormName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Theme Emoji"
            value={formEmoji}
            onChangeText={setFormEmoji}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Primary Color (Hex, e.g. #6366F1)"
            value={formPrimary}
            onChangeText={setFormPrimary}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Accent Color (Hex, e.g. #10B981)"
            value={formAccent}
            onChangeText={setFormAccent}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Background Color (Hex)"
            value={formBackground}
            onChangeText={setFormBackground}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Surface Color (Hex)"
            value={formSurface}
            onChangeText={setFormSurface}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>Dark Mode Theme</Text>
            <Switch
              value={formIsDark}
              onValueChange={setFormIsDark}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>Theme Enabled</Text>
            <Switch
              value={formIsActive}
              onValueChange={setFormIsActive}
            />
          </View>

          <View style={styles.formButtons}>
            <Button
              mode="outlined"
              onPress={() => setEditingTheme(null)}
              style={styles.formBtn}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveTheme}
              style={styles.formBtn}
            >
              Save
            </Button>
          </View>
        </ScrollView>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeTab === 'requests' ? (
        requests.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>No pending requests.</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.$id}
            renderItem={renderRequestItem}
            contentContainerStyle={styles.list}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => handleStartEditTheme(null)}
            style={styles.addThemeBtn}
          >
            Create New Theme
          </Button>

          <FlatList
            data={themes}
            keyExtractor={(item, index) => item.$id || index.toString()}
            renderItem={renderThemeItem}
            contentContainerStyle={styles.list}
          />
        </View>
      )}
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedButtons: {
    width: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginBottom: 12,
  },
  usecaseBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  usecaseLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    minWidth: 100,
  },
  themeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeInfoCol: {
    flex: 1,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  colorLabel: {
    fontSize: 11,
    color: '#666',
  },
  themeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addThemeBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  editForm: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  formBtn: {
    flex: 0.47,
  },
});
