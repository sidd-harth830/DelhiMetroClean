import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Animated } from 'react-native';
import { Avatar, List, Text, useTheme, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius } from '../theme/colors';
import { FavoritesStorage } from '../storage/favorites';

/* ─── Animated stat counter ─── */
function AnimatedStat({ value, label, icon, color, bgColor }: {
    value: number;
    label: string;
    icon: string;
    color: string;
    bgColor: string;
}) {
    const countAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const theme = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
            Animated.timing(countAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, [value]);

    return (
        <Animated.View style={[styles.statCard, { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name={icon as any} size={20} color={color} />
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        </Animated.View>
    );
}

export function ProfileScreen() {
    const theme = useTheme();
    const { isDark, semantic } = useAppTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const isGuest = !user || !user.email; // Appwrite anonymous users don't have emails
    const [savedRoutesCount, setSavedRoutesCount] = useState(0);
    const [favoriteStationsCount, setFavoriteStationsCount] = useState(0);

    // ─── Animated entrance ───
    const headerFade = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(0.95)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.parallel([
                Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(headerScale, { toValue: 1, useNativeDriver: true, friction: 8 }),
            ]),
            Animated.parallel([
                Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(contentSlide, { toValue: 0, useNativeDriver: true, friction: 8 }),
            ]),
        ]).start();
    }, []);

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

    const primaryColor = theme.colors.primary;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            {/* ─── Gradient Hero Header ─── */}
            <Animated.View style={[
                styles.heroHeader,
                {
                    backgroundColor: isDark ? `${primaryColor}10` : `${primaryColor}06`,
                    opacity: headerFade,
                    transform: [{ scale: headerScale }],
                },
            ]}>
                {/* Decorative accent circle */}
                <View style={[styles.heroAccentCircle, { backgroundColor: `${primaryColor}08`, top: -30, right: -30 }]} />
                <View style={[styles.heroAccentCircle, { backgroundColor: `${primaryColor}06`, bottom: -20, left: -20, width: 100, height: 100 }]} />
                
                {/* Avatar with glowing ring */}
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatarGlowRing, { borderColor: `${primaryColor}30` }]}>
                        <Avatar.Text 
                            size={80} 
                            label={isGuest ? 'G' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')} 
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            labelStyle={{ color: theme.colors.primary, fontWeight: '800' }}
                        />
                    </View>
                </View>

                <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
                    {isGuest ? 'Guest User' : (user?.name || 'User')}
                </Text>
                {!isGuest && user?.email && (
                    <View style={[styles.emailBadge, { backgroundColor: isDark ? `${primaryColor}15` : `${primaryColor}08` }]}>
                        <Ionicons name="mail" size={12} color={primaryColor} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {user.email}
                        </Text>
                    </View>
                )}

                {/* ─── Stats Row ─── */}
                <View style={styles.statsRow}>
                    <AnimatedStat
                        value={savedRoutesCount}
                        label="Routes"
                        icon="bookmark"
                        color={semantic.info}
                        bgColor={isDark ? `${semantic.info}15` : `${semantic.info}08`}
                    />
                    <AnimatedStat
                        value={favoriteStationsCount}
                        label="Favorites"
                        icon="star"
                        color={semantic.warning}
                        bgColor={isDark ? `${semantic.warning}15` : `${semantic.warning}08`}
                    />
                    <AnimatedStat
                        value={isGuest ? 0 : 1}
                        label={isGuest ? 'Guest' : 'Synced'}
                        icon={isGuest ? 'person-outline' : 'cloud-done'}
                        color={semantic.success}
                        bgColor={isDark ? `${semantic.success}15` : `${semantic.success}08`}
                    />
                </View>
            </Animated.View>

            {/* ─── Guest CTA ─── */}
            {isGuest && (
                <Animated.View style={[
                    styles.card, 
                    { 
                        backgroundColor: theme.colors.surface, 
                        borderColor: isDark ? `${primaryColor}20` : `${primaryColor}10`,
                        borderWidth: 1,
                        opacity: contentFade,
                        transform: [{ translateY: contentSlide }],
                    }
                ]}>
                    <View style={styles.ctaHeader}>
                        <Ionicons name="sparkles" size={20} color={primaryColor} />
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                            Unlock Full Features
                        </Text>
                    </View>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.lg }}>
                        Create an account to sync your favorite stations, saved routes, and preferences across devices.
                    </Text>
                    <Button 
                        mode="contained" 
                        onPress={handleLogout} // Logging out of guest session returns to login screen
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                        style={{ borderRadius: bentoRadius.button }}
                        icon="account-plus"
                        contentStyle={{ paddingVertical: 4 }}
                        labelStyle={{ fontWeight: '700' }}
                    >
                        Create Account
                    </Button>
                </Animated.View>
            )}

            {/* ─── Metro Features ─── */}
            <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
                <List.Section style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="train" size={16} color={theme.colors.primary} />
                        <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Metro Features</List.Subheader>
                    </View>
                    <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
                        <List.Item
                            title="Metro Lines & Stations"
                            description="Browse all metro lines and stations"
                            left={(props) => <List.Icon {...props} icon="transit-connection" color={theme.colors.primary} />}
                            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                            onPress={() => navigation.navigate('LinesStack')}
                            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        />
                        <List.Item
                            title="Explore Delhi"
                            description="Discover points of interest near stations"
                            left={(props) => <List.Icon {...props} icon="map-marker-radius" color={theme.colors.primary} />}
                            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
                            onPress={() => navigation.navigate('ExploreStack')}
                            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        />
                    </View>
                </List.Section>

                {/* ─── Preferences ─── */}
                <List.Section style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="heart" size={16} color={theme.colors.primary} />
                        <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Preferences</List.Subheader>
                    </View>
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

                {/* ─── Admin ─── */}
                {user?.email === 'leocarnivas@gmail.com' && (
                    <List.Section style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="shield-checkmark" size={16} color={theme.colors.error} />
                            <List.Subheader style={{ color: theme.colors.error, fontWeight: '700' }}>Admin</List.Subheader>
                        </View>
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

                {/* ─── Logout ─── */}
                {!isGuest && (
                    <Button 
                        mode="outlined" 
                        onPress={handleLogout}
                        style={[styles.logoutButton, { borderColor: theme.colors.error }]}
                        textColor={theme.colors.error}
                        icon="logout"
                    >
                        Log Out
                    </Button>
                )}
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroHeader: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.xl,
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
        borderRadius: bentoRadius.heroCard,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    heroAccentCircle: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    avatarContainer: {
        marginBottom: spacing.md,
    },
    avatarGlowRing: {
        borderWidth: 3,
        borderRadius: 50,
        padding: 4,
    },
    name: {
        fontWeight: '800',
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: bentoRadius.badge,
        marginTop: spacing.sm,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg,
        width: '100%',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: bentoRadius.icon,
        gap: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    card: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.xl,
        padding: spacing.lg,
        borderRadius: bentoRadius.card,
    },
    ctaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    section: {
        marginHorizontal: spacing.base,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 4,
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