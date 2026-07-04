import React, { useState, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert, Pressable, Animated as RNAnimated } from 'react-native';
import { ActivityIndicator, List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { palettes } from '../theme/palettes';
import Constants from 'expo-constants';
import { databases } from '../config/appwrite';
import { Query } from 'react-native-appwrite';
import { classifyError } from '../api/errors';

/* ─── Animated Palette Card ─── */
function PaletteCard({
    palette,
    isActive,
    isDark,
    onPress,
    themeColors,
}: {
    palette: (typeof palettes)[0];
    isActive: boolean;
    isDark: boolean;
    onPress: () => void;
    themeColors: any;
}) {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;
    const colors = isDark ? palette.dark : palette.light;
    const accentColor = colors.accent ?? colors.primary;

    const handlePressIn = useCallback(() => {
        RNAnimated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        RNAnimated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 80,
        }).start();
    }, [scaleAnim]);

    return (
        <RNAnimated.View style={[styles.paletteCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.paletteCard,
                    {
                        backgroundColor: isDark ? colors.surface : colors.background,
                        borderColor: isActive ? colors.primary : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                        borderWidth: isActive ? 2.5 : 1,
                    },
                ]}
            >
                {/* Active checkmark badge */}
                {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={12} color={colors.onPrimary ?? '#FFFFFF'} />
                    </View>
                )}

                {/* Icon + Name row */}
                <View style={styles.paletteHeader}>
                    <View style={[styles.paletteIconCircle, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons
                            name={(palette.icon || 'color-palette') as any}
                            size={20}
                            color={colors.primary}
                        />
                    </View>
                    <Text
                        style={[
                            styles.paletteName,
                            { color: isDark ? colors.onSurface : colors.onBackground },
                        ]}
                        numberOfLines={1}
                    >
                        {palette.name}
                    </Text>
                </View>

                {/* Color preview strip */}
                <View style={styles.colorStrip}>
                    <View style={[styles.colorDot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
                    <View style={[styles.colorDot, { backgroundColor: colors.success }]} />
                    <View style={[styles.colorDot, { backgroundColor: colors.warning }]} />
                    <View style={[styles.colorDot, { backgroundColor: colors.info }]} />
                </View>

                {/* Preview bar */}
                <View style={[styles.previewBar, { backgroundColor: colors.primaryMuted }]}>
                    <View style={[styles.previewAccent, { backgroundColor: colors.primary }]} />
                </View>
            </Pressable>
        </RNAnimated.View>
    );
}

export function SettingsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { themeMode, setThemeMode, isDark, colorPaletteId, setColorPalette } = useAppTheme();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();
    
    const [isClearing, setIsClearing] = useState(false);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

    const isVersionGreater = (v1: string, v2: string) => {
        const p1 = v1.split('.').map(Number);
        const p2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }
        return false;
    };

    const handleCheckForUpdates = async () => {
        try {
            setIsCheckingUpdate(true);

            // 1. Check OTA updates (bug fixes, UI tweaks, settings changes)
            if (!__DEV__) {
                const otaUpdate = await Updates.checkForUpdateAsync();
                if (otaUpdate.isAvailable) {
                    Alert.alert(
                        'Update Available',
                        'A minor update with bug fixes and improvements is available. Install now?',
                        [
                            { text: 'Later', style: 'cancel' },
                            {
                                text: 'Install',
                                onPress: async () => {
                                    try {
                                        await Updates.fetchUpdateAsync();
                                        await Updates.reloadAsync();
                                    } catch {
                                        Alert.alert('Error', 'Failed to install update.');
                                    }
                                },
                            },
                        ]
                    );
                    return;
                }
            }

            // 2. Check for new app version releases (Appwrite)
            const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
            const collectionId = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;
            if (databaseId && collectionId) {
                const response = await databases.listDocuments(
                    databaseId,
                    collectionId,
                    [
                        Query.orderDesc('releaseDate'),
                        Query.equal('status', 'released'),
                        Query.limit(1)
                    ]
                );
                if (response.documents.length > 0) {
                    const latestRelease = response.documents[0];
                    const currentVersion = Constants.expoConfig?.version || require('../../package.json').version || '1.0.0';
                    if (isVersionGreater(latestRelease.versionNumber, currentVersion)) {
                        Alert.alert(
                            'New Version Available',
                            `Version ${latestRelease.versionNumber} is available with new features. Please update to enjoy the latest experience.`,
                            [
                                ...(latestRelease.isMandatory ? [] : [{ text: 'Later', style: 'cancel' as const }]),
                                {
                                    text: 'Download',
                                    onPress: () => {
                                        if (latestRelease.apkUrl) {
                                            const { Linking } = require('react-native');
                                            Linking.openURL(latestRelease.apkUrl);
                                        }
                                    },
                                },
                            ]
                        );
                        return;
                    }
                }
            }

            Alert.alert('Up to Date', 'You are running the latest version of the app.');
        } catch (error: unknown) {
            if (error instanceof Error && error?.message?.includes('Collection with the requested ID')) {
                Alert.alert('Up to Date', 'You are running the latest version.');
            } else {
                const classified = classifyError(error);
                Alert.alert(
                    classified.type === 'network' ? 'No Internet' : 'Error',
                    classified.type === 'network'
                        ? 'Could not check for updates. Please check your internet connection.'
                        : 'Could not check for updates. Please try again later.',
                );
            }
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    const handleClearCache = async () => {
        try {
            setIsClearing(true);
            queryClient.clear();
            await AsyncStorage.clear();
            // Restore theme mode so the user doesn't lose it immediately after clearing
            await AsyncStorage.setItem('@app_theme_mode', themeMode);
            Alert.alert('Success', 'Cache cleared successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to clear cache.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error: unknown) {
                        const classified = classifyError(error);
                        Alert.alert(
                            classified.type === 'network' ? 'No Internet' : 'Error',
                            classified.type === 'network'
                                ? 'Could not log out. Please check your internet connection.'
                                : 'Failed to log out. Please try again.',
                        );
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            {/* ─── Header ─── */}
            <View style={styles.headerRow}>
                <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onSurface }]}>
                    Settings
                </Text>
                <View style={[styles.headerBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <Ionicons name="settings" size={16} color={theme.colors.primary} />
                </View>
            </View>

            {/* ─── Account Section ─── */}
            <List.Section style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="person" size={16} color={theme.colors.primary} />
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Account</List.Subheader>
                </View>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title={user?.email ? "Logged in as" : "Guest Mode"}
                        description={user?.email || "Local storage only"}
                        left={(props) => <List.Icon {...props} icon="account-circle" color={theme.colors.primary} />}
                        right={(props) => 
                            user?.email ? (
                                <Text style={{ color: theme.colors.error, alignSelf: 'center', marginRight: spacing.md }} onPress={handleLogout}>Log Out</Text>
                            ) : null
                        }
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    />
                </View>
            </List.Section>

            {/* ─── Appearance Section ─── */}
            <List.Section style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="contrast" size={16} color={theme.colors.primary} />
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Appearance</List.Subheader>
                </View>
                <View style={[styles.card, { backgroundColor: theme.colors.surface, padding: spacing.md }]}>
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Choose your preferred display mode
                    </Text>
                    <SegmentedButtons
                        value={themeMode}
                        onValueChange={(value) => setThemeMode(value as any)}
                        buttons={[
                            {
                                value: 'system',
                                label: 'System',
                                icon: 'theme-light-dark',
                                checkedColor: theme.colors.onPrimary,
                                uncheckedColor: theme.colors.onSurfaceVariant,
                                style: {
                                    backgroundColor: themeMode === 'system'
                                        ? theme.colors.primary
                                        : 'transparent',
                                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline,
                                },
                            },
                            {
                                value: 'light',
                                label: 'Light',
                                icon: 'weather-sunny',
                                checkedColor: theme.colors.onPrimary,
                                uncheckedColor: theme.colors.onSurfaceVariant,
                                style: {
                                    backgroundColor: themeMode === 'light'
                                        ? theme.colors.primary
                                        : 'transparent',
                                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline,
                                },
                            },
                            {
                                value: 'dark',
                                label: 'Dark',
                                icon: 'weather-night',
                                checkedColor: theme.colors.onPrimary,
                                uncheckedColor: theme.colors.onSurfaceVariant,
                                style: {
                                    backgroundColor: themeMode === 'dark'
                                        ? theme.colors.primary
                                        : 'transparent',
                                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline,
                                },
                            },
                        ]}
                    />
                </View>
            </List.Section>

            {/* ─── Color Theme Grid ─── */}
            <List.Section style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="color-palette" size={16} color={theme.colors.primary} />
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Color Theme</List.Subheader>
                </View>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant, marginBottom: spacing.md, marginLeft: 2 }]}>
                    Pick a palette that matches your style
                </Text>
                <View style={styles.paletteGrid}>
                    {palettes.map((p) => (
                        <PaletteCard
                            key={p.id}
                            palette={p}
                            isActive={p.id === colorPaletteId}
                            isDark={isDark}
                            onPress={() => setColorPalette(p.id)}
                            themeColors={theme.colors}
                        />
                    ))}
                </View>
            </List.Section>

            {/* ─── Data & Storage ─── */}
            <List.Section style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="server" size={16} color={theme.colors.primary} />
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Data & Storage</List.Subheader>
                </View>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Clear Cache"
                        description="Free up space and clear saved preferences"
                        left={(props) => 
                            isClearing ? 
                            <ActivityIndicator {...props} size={24} style={[props.style, { margin: 8 }]} color={theme.colors.error} /> :
                            <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />
                        }
                        onPress={handleClearCache}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        disabled={isClearing}
                    />
                </View>
            </List.Section>

            {/* ─── App Info ─── */}
            <List.Section style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>App Info</List.Subheader>
                </View>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Version"
                        description={Constants.expoConfig?.version || require('../../package.json').version || '1.0.0'}
                        left={(props) => <List.Icon {...props} icon="information-outline" color={theme.colors.primary} />}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    />
                    <List.Item
                        title="Check for Updates"
                        description="Check for OTA patches or new releases"
                        left={(props) => 
                            isCheckingUpdate ?
                            <ActivityIndicator {...props} size={24} style={[props.style, { margin: 8 }]} color={theme.colors.primary} /> :
                            <List.Icon {...props} icon="update" color={theme.colors.primary} />
                        }
                        onPress={handleCheckForUpdates}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        disabled={isCheckingUpdate}
                    />
                </View>
            </List.Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.base,
        marginBottom: spacing.md,
    },
    header: {
        fontWeight: '800',
    },
    headerBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.sm,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
        marginBottom: spacing.md,
    },
    card: {
        borderRadius: bentoRadius.card,
        overflow: 'hidden',
    },
    /* ─── Palette Grid ─── */
    paletteGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.bentoGap,
    },
    paletteCardWrapper: {
        width: '47.5%',
    },
    paletteCard: {
        borderRadius: bentoRadius.card,
        padding: spacing.md,
        gap: spacing.sm,
        overflow: 'hidden',
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    paletteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    paletteIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paletteName: {
        fontWeight: '700',
        fontSize: 13,
        flex: 1,
    },
    colorStrip: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    previewBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    previewAccent: {
        height: '100%',
        width: '60%',
        borderRadius: 3,
    },
});