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
} from 'react-native';
import { Text, Button, Surface, useTheme, Card, IconButton } from 'react-native-paper';
import { ID, Query } from 'react-native-appwrite';
import { useAuth } from '../auth/AuthContext';
import { databases } from '../config/appwrite';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius, bentoShadows } from '../theme/colors';

// Appwrite config from .env or fallback
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'ApiKeys'; // The one we created

export function ApiPortalScreen() {
  const { user, signInWithGoogle } = useAuth();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usecase, setUsecase] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === 'leocarnivas@gmail.com';

  useEffect(() => {
    if (user && user.email) {
      checkApiStatus();
    } else {
      setLoading(false);
    }
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

  if (!user || !user.email) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Ionicons name="code-slash-outline" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Developer Portal</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Login to request access to the Premium Metro API.
          </Text>
          <Button
            mode="contained"
            onPress={signInWithGoogle}
            style={styles.loginBtn}
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
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
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

        <Surface style={[styles.card, isDark ? bentoShadows.dark : bentoShadows.light, { backgroundColor: theme.colors.elevation.level1 }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Metro Route Premium API</Text>
          <Text style={[styles.bodyText, { color: theme.colors.onSurfaceVariant }]}>
            Get programmatic access to live Delhi and Noida Metro data, routes, and station details. 
            Currently available in closed beta.
          </Text>
        </Surface>

        {requestStatus === 'none' && (
          <Surface style={[styles.card, isDark ? bentoShadows.dark : bentoShadows.light, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Request Access</Text>
            <Text style={[styles.bodyText, { color: theme.colors.onSurfaceVariant, marginBottom: 16 }]}>
              Please describe what you plan to build with our API. Our admin will review your request.
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outlineVariant,
                }
              ]}
              placeholder="e.g. A personal web dashboard for my commute..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
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
              style={{ marginTop: 16 }}
            >
              Submit Request
            </Button>
          </Surface>
        )}

        {requestStatus === 'pending' && (
          <Surface style={[styles.card, styles.statusCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Ionicons name="time-outline" size={32} color={theme.colors.onSecondaryContainer} />
            <Text style={[styles.cardTitle, { color: theme.colors.onSecondaryContainer, marginTop: 8 }]}>Review Pending</Text>
            <Text style={[styles.bodyText, { color: theme.colors.onSecondaryContainer, textAlign: 'center' }]}>
              Your request is currently being reviewed by an admin. Check back later!
            </Text>
          </Surface>
        )}

        {requestStatus === 'rejected' && (
          <Surface style={[styles.card, styles.statusCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Ionicons name="close-circle-outline" size={32} color={theme.colors.onErrorContainer} />
            <Text style={[styles.cardTitle, { color: theme.colors.onErrorContainer, marginTop: 8 }]}>Access Denied</Text>
            <Text style={[styles.bodyText, { color: theme.colors.onErrorContainer, textAlign: 'center' }]}>
              Unfortunately, your request for API access was not approved at this time.
            </Text>
          </Surface>
        )}

        {requestStatus === 'approved' && apiKey && (
          <Surface style={[styles.card, isDark ? bentoShadows.dark : bentoShadows.light, { backgroundColor: theme.colors.elevation.level1 }]}>
            <View style={styles.approvedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface, marginLeft: 8 }]}>Access Granted</Text>
            </View>
            
            <Text style={[styles.bodyText, { color: theme.colors.onSurfaceVariant, marginBottom: 16 }]}>
              You can now use the API. Include your key in the 'x-api-key' header.
            </Text>

            <View style={[
              styles.apiKeyBox, 
              { 
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                borderColor: theme.colors.outlineVariant
              }
            ]}>
              <Text style={[styles.apiKeyText, { color: theme.colors.onSurface }]} selectable>
                {apiKey}
              </Text>
              <IconButton
                icon="content-copy"
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
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
