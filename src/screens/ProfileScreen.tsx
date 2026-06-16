import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, List, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme';

export function ProfileScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.tabBarClearance }}
        >
            <View style={styles.header}>
                <Avatar.Icon size={80} icon="account" />
                <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
                    Guest User
                </Text>
            </View>

            <List.Section>
                <List.Subheader>Metro Features</List.Subheader>
                <List.Item
                    title="Metro Lines & Stations"
                    left={(props) => <List.Icon {...props} icon="transit-connection" />}
                    onPress={() => navigation.navigate('LinesStack')}
                />
                <List.Item
                    title="Explore Delhi"
                    left={(props) => <List.Icon {...props} icon="map-marker-radius" />}
                    onPress={() => navigation.navigate('ExploreStack')}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>Preferences</List.Subheader>
                <List.Item
                    title="Saved Routes"
                    description="Quick access to your regular journeys"
                    left={(props) => <List.Icon {...props} icon="bookmark-outline" />}
                    onPress={() => { }}
                />
                <List.Item
                    title="Favorite Stations"
                    description="Your most visited stations"
                    left={(props) => <List.Icon {...props} icon="star-outline" />}
                    onPress={() => { }}
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
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    name: {
        fontWeight: '700',
        marginTop: spacing.md,
    },
});