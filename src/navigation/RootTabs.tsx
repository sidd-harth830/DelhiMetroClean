import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeStack } from './HomeStack';
import { ExploreStack } from './ExploreStack';
import { LinesStack } from './LinesStack';
import { MapStack } from './MapStack';
import { AlertsStack } from './AlertsStack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { focused: 'train', default: 'train-outline' },
  SearchTab: { focused: 'search', default: 'search-outline' },
  LinesTab: { focused: 'git-branch', default: 'git-branch-outline' },
  MapTab: { focused: 'map', default: 'map-outline' },
  AlertsTab: { focused: 'notifications', default: 'notifications-outline' },
  ProfileTab: { focused: 'person-circle', default: 'person-circle-outline' },
  SettingsTab: { focused: 'cog', default: 'cog-outline' },
};

function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: theme.colors.elevation.level2,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.default;
          return (
            <View
              style={{
                width: 64,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? theme.colors.primary : color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MapTab" component={MapStack} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="AlertsTab" component={AlertsStack} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export function RootTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="ExploreStack" component={ExploreStack} />
      <Stack.Screen name="LinesStack" component={LinesStack} />
    </Stack.Navigator>
  );
}
