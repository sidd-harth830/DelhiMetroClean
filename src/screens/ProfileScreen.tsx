import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Avatar, List, Text, useTheme, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius } from '../theme/colors';
import { FavoritesStorage } from '../storage/favorites';

export function ProfileScreen() {
    const theme = useTheme();
    const { isDark, semantic } = useAppTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const isGuest = !user || !user.email; // Appwrite anonymous users don't have emails
    const [savedRoutesCount, setSavedRoutesCount] = useState(0);
    const [favoriteStationsCount, setFavoriteStationsCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            FavoritesStorage.getSavedRoutes().then(routes => setSavedRoutesCount(routes.length));
            FavoritesStorage.getFavoriteStations().then(stations => setFavoriteStationsCount(stations.length));
        }, [])
    );

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to log out.');
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            <View style={styles.header}>
                <Avatar.Text 
                    size={80} 
                    label={isGuest ? 'G' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')} 
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    labelStyle={{ color: theme.colors.primary, fontWeight: '800' }}
                />
                <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
                    {isGuest ? 'Guest User' : (user?.name || 'User')}
                </Text>
                {!isGuest && user?.email && (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}>
                        {user.email}
                    </Text>
                )}
            </View>

            {isGuest && (
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant, borderWidth: 1 }]}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: spacing.xs }}>
                        Unlock Full Features
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.lg }}>
                        Create an account to sync your favorite stations, saved routes, and preferences across devices.
                    </Text>
                    <Button 
                        mode="contained" 
                        onPress={handleLogout} // Logging out of guest session returns to login screen
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                        style={{ borderRadius: bentoRadius.button }}
                    >
                        Create Account
                    </Button>
                </View>
            )}

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Metro Features</List.Subheader>
                <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Metro Lines & Stations"
                        left={(props) => <List.Icon {...props} icon="transit-connection" color={theme.colors.primary} />}
                        onPress={() => navigation.navigate('LinesStack')}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                    />
                    <List.Item
                        title="Explore Delhi"
                        left={(props) => <List.Icon {...props} icon="map-marker-radius" color={theme.colors.primary} />}
                        onPress={() => navigation.navigate('ExploreStack')}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                    />
                </View>
            </List.Section>

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Preferences</List.Subheader>
                <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Saved Routes"
                        description={savedRoutesCount > 0 ? `${savedRoutesCount} saved route${savedRoutesCount !== 1 ? 's' : ''}` : 'Quick access to your regular journeys'}
                        left={(props) => <List.Icon {...props} icon="bookmark-outline" color={theme.colors.secondary} />}
                        right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                        onPress={() => navigation.navigate('SavedRoutes' as never)}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    />
                    <List.Item
                        title="Favorite Stations"
                        description={favoriteStationsCount > 0 ? `${favoriteStationsCount} favorite station${favoriteStationsCount !== 1 ? 's' : ''}` : 'Your most visited stations'}
                        left={(props) => <List.Icon {...props} icon="star-outline" color={semantic.warning} />}
                        right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                        onPress={() => navigation.navigate('FavoriteStations' as never)}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    />
                </View>
            </List.Section>

            {user?.email === 'leocarnivas@gmail.com' && (
                <List.Section style={styles.section}>
                    <List.Subheader style={{ color: theme.colors.error, fontWeight: '700' }}>Admin</List.Subheader>
                    <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
                        <List.Item
                            title="Admin Dashboard"
                            description="Manage API key requests"
                            left={(props) => <List.Icon {...props} icon="shield-check" color={theme.colors.error} />}
                            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                            onPress={() => navigation.navigate('AdminDashboard')}
                            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        />
                    </View>
                </List.Section>
            )}

            {!isGuest && (
                <Button 
                    mode="outlined" 
                    onPress={handleLogout}
                    style={[styles.logoutButton, { borderColor: theme.colors.error }]}
                    textColor={theme.colors.error}
                >
                    Log Out
                </Button>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    name: {
        fontWeight: '800',
        marginTop: spacing.md,
    },
    card: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.xl,
        padding: spacing.lg,
        borderRadius: bentoRadius.card,
    },
    section: {
        marginHorizontal: spacing.base,
    },
    listCard: {
        borderRadius: bentoRadius.card,
        overflow: 'hidden',
    },
    logoutButton: {
        marginHorizontal: spacing.base,
        marginTop: spacing.xl,
        borderRadius: bentoRadius.button,
    }
});