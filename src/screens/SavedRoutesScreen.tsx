import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesStorage, SavedRoute } from '../storage/favorites';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { EmptyState } from '../components/EmptyState';

type Nav = NativeStackNavigationProp<any>;

export function SavedRoutesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isDark, semantic } = useAppTheme();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);

  const loadRoutes = useCallback(() => {
    FavoritesStorage.getSavedRoutes().then(setRoutes);
  }, []);

  useFocusEffect(loadRoutes);

  const handleRemove = (fromCode: string, toCode: string) => {
    Alert.alert('Remove Route', 'Are you sure you want to remove this saved route?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await FavoritesStorage.removeSavedRoute(fromCode, toCode);
          loadRoutes();
        },
      },
    ]);
  };

  const handleNavigate = (route: SavedRoute) => {
    navigation.navigate('HomeTab', {
      screen: 'JourneyResults',
      params: {
        fromCode: route.fromCode,
        toCode: route.toCode,
        fromName: route.fromName,
        toName: route.toName,
      },
    });
  };

  if (routes.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState title="No saved routes yet" subtitle="Star a route from journey results to save it here." />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.tabBarClearance }]}
    >
      {routes.map((route) => (
        <Pressable
          key={`${route.fromCode}-${route.toCode}`}
          style={[
            styles.routeCard,
            {
              backgroundColor: isDark
                ? theme.colors.surface
                : theme.colors.surface,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.06)',
            },
          ]}
          onPress={() => handleNavigate(route)}
          onLongPress={() => handleRemove(route.fromCode, route.toCode)}
        >
          <View style={styles.routeInfo}>
            {/* From station */}
            <View style={styles.stationRow}>
              <View style={[styles.dot, { backgroundColor: semantic.success }]} />
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}
                numberOfLines={1}
              >
                {route.fromName}
              </Text>
            </View>

            {/* Connector */}
            <View style={styles.connector}>
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.outlineVariant }]} />
            </View>

            {/* To station */}
            <View style={styles.stationRow}>
              <View style={[styles.dot, { backgroundColor: semantic.error }]} />
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}
                numberOfLines={1}
              >
                {route.toName}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => handleNavigate(route)}
              style={[styles.actionBtn, { backgroundColor: `${theme.colors.primary}15` }]}
            >
              <Ionicons name="navigate" size={18} color={theme.colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => handleRemove(route.fromCode, route.toCode)}
              style={[styles.actionBtn, { backgroundColor: `${semantic.error}15` }]}
            >
              <Ionicons name="trash-outline" size={18} color={semantic.error} />
            </Pressable>
          </View>
        </Pressable>
      ))}

      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.md, opacity: 0.6 }}
      >
        Long press a route to remove it
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.md,
  },
  routeCard: {
    borderRadius: bentoRadius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeInfo: {
    flex: 1,
    gap: 0,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connector: {
    marginLeft: 4,
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 16,
    marginLeft: 3,
  },
  actions: {
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
