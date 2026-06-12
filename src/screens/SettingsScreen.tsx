import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export function SettingsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { themeMode, setThemeMode } = useAppTheme();
    const queryClient = useQueryClient();

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

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }}
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
                    description="1.0.0"
                    left={(props) => <List.Icon {...props} icon="information-outline" />}
                />
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
});