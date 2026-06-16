import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import appConfig from '../../app.json';
import { client } from '../config/appwrite';

export function SettingsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { themeMode, setThemeMode } = useAppTheme();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();
    
    const [isClearing, setIsClearing] = useState(false);
    const [isPinging, setIsPinging] = useState(false);

    const handlePing = async () => {
        try {
            setIsPinging(true);
            const startTime = Date.now();
            await client.ping();
            const latency = Date.now() - startTime;
            Alert.alert(
                'Connection Verified',
                `Successfully connected to Appwrite!\nLatency: ${latency}ms\n\nEndpoint: sgp.cloud.appwrite.io\nProject: 6a2ce46a003230dcf661`
            );
        } catch (error: any) {
            Alert.alert(
                'Connection Failed',
                error.message || 'Could not verify connection to Appwrite. Please ensure the platform is registered on your console.'
            );
        } finally {
            setIsPinging(false);
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
            contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onSurface }]}>
                Settings
            </Text>

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Account</List.Subheader>
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

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Appearance</List.Subheader>
                <View style={[styles.card, { backgroundColor: theme.colors.surface, padding: spacing.md }]}>
                    <SegmentedButtons
                        value={themeMode}
                        onValueChange={(value) => setThemeMode(value as any)}
                        buttons={[
                            { value: 'system', label: 'System' },
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                        ]}
                    />
                </View>
            </List.Section>

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Data & Storage</List.Subheader>
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

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>Developer Tools</List.Subheader>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Send a Ping"
                        description={isPinging ? "Pinging Appwrite..." : "Verify Appwrite SDK connection"}
                        left={(props) => 
                            isPinging ? 
                            <ActivityIndicator {...props} size={24} style={[props.style, { margin: 8 }]} color={theme.colors.primary} /> :
                            <List.Icon {...props} icon="wifi" color={theme.colors.primary} />
                        }
                        onPress={handlePing}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        disabled={isPinging}
                    />
                </View>
            </List.Section>

            <List.Section style={styles.section}>
                <List.Subheader style={{ color: theme.colors.primary, fontWeight: '700' }}>App Info</List.Subheader>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Version"
                        description={appConfig.expo.version}
                        left={(props) => <List.Icon {...props} icon="information-outline" color={theme.colors.primary} />}
                        titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
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
    header: {
        fontWeight: '800',
        paddingHorizontal: spacing.base,
        marginBottom: spacing.md,
    },
    section: {
        marginHorizontal: spacing.base,
        marginBottom: spacing.sm,
    },
    card: {
        borderRadius: bentoRadius.card,
        overflow: 'hidden',
    },
});