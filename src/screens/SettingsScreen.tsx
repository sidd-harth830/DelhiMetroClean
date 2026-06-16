import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, List, SegmentedButtons, Text, useTheme, ProgressBar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useUpdates } from 'expo-updates';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import appConfig from '../../app.json';

export function SettingsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { themeMode, setThemeMode } = useAppTheme();
    const queryClient = useQueryClient();
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const updatesInfo = useUpdates() as any;
    const { currentlyRunning, isUpdateAvailable, isUpdatePending, isDownloading } = updatesInfo;
    const downloadedBytes: number = updatesInfo.downloadedBytes ?? 0;
    const totalBytes: number = updatesInfo.totalBytes ?? 0;

    const handleClearCache = async () => {
        try {
            queryClient.clear();
            await AsyncStorage.clear();
            // Restore theme mode so the user doesn't lose it immediately after clearing
            await AsyncStorage.setItem('@app_theme_mode', themeMode);
            Alert.alert('Success', 'Cache cleared successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to clear cache.');
        }
    };

    const handleCheckForUpdates = async () => {
        try {
            setIsCheckingUpdate(true);
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                Alert.alert('Update Available', 'A new version is downloading. The app will restart shortly.');
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            } else {
                Alert.alert('Up to Date', 'You are running the latest version.');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to check for updates. Please check your internet connection.');
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onSurface }]}>
                Settings
            </Text>

            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <View style={styles.themeSelector}>
                    <SegmentedButtons
                        value={themeMode}
                        onValueChange={(value) => setThemeMode(value as any)}
                        buttons={[
                            { value: 'system', label: 'System' },
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                            { value: 'amoled', label: 'AMOLED' },
                        ]}
                    />
                </View>
            </List.Section>

            <List.Section>
                <List.Subheader>Data & Storage</List.Subheader>
                <List.Item
                    title="Clear Cache"
                    description="Free up space and clear saved preferences"
                    left={(props) => <List.Icon {...props} icon="delete-outline" />}
                    onPress={handleClearCache}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>App Info</List.Subheader>
                <List.Item
                    title="Version"
                    description={appConfig.expo.version}
                    left={(props) => <List.Icon {...props} icon="information-outline" />}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>System</List.Subheader>
                <List.Item
                    title="Check for Updates"
                    description="Tap to check the cloud for new features"
                    left={(props) =>
                        isCheckingUpdate ? (
                            <ActivityIndicator {...props} size={24} style={[props.style, { margin: 8 }]} />
                        ) : (
                            <List.Icon {...props} icon="cloud-download" />
                        )
                    }
                    onPress={handleCheckForUpdates}
                    disabled={isCheckingUpdate || isDownloading}
                />
                {isDownloading && (
                    <View style={styles.progressContainer}>
                        <ProgressBar
                            progress={totalBytes > 0 ? downloadedBytes / totalBytes : 0}
                            color={theme.colors.primary}
                            style={styles.progressBar}
                        />
                        <Text variant="labelSmall" style={[styles.progressText, { color: theme.colors.outline }]}>
                            Downloading update: {(downloadedBytes / 1048576).toFixed(2)} MB / {totalBytes > 0 ? (totalBytes / 1048576).toFixed(2) : '0.00'} MB
                        </Text>
                    </View>
                )}
            </List.Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontWeight: '700',
        paddingHorizontal: spacing.base,
        marginBottom: spacing.md,
    },
    themeSelector: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
    },
    progressContainer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.sm,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: spacing.xs,
    },
    progressText: {
        textAlign: 'center',
    },
});