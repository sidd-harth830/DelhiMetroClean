import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Text, Surface, useTheme, Button, IconButton } from 'react-native-paper';
import { databases } from '../config/appwrite';
import { Query } from 'react-native-appwrite';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius, bentoShadows } from '../theme/colors';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'ApiKeys';

// Generate a secure looking API key
const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'dmrc_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== 'leocarnivas@gmail.com') {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      navigation.goBack();
      return;
    }
    fetchPendingRequests();
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      fetchPendingRequests(); // Refresh list
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
      Alert.alert('Error', `Failed to ${action} request.`);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Surface style={[styles.card, isDark ? bentoShadows.dark : bentoShadows.light, { backgroundColor: theme.colors.elevation.level1 }]}>
      <Text style={[styles.email, { color: theme.colors.onSurface }]}>{item.email}</Text>
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
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.elevation.level2 }]}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <IconButton icon="refresh" onPress={fetchPendingRequests} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 16 }}>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: bentoRadius.large,
    padding: 16,
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
});
