import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { Platform, StyleSheet, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { HomeStack } from "./HomeStack";
import { ExploreStack } from "./ExploreStack";
import { LinesStack } from "./LinesStack";
import { MapStack } from "./MapStack";
import { AlertsStack } from "./AlertsStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { useAppTheme } from "../theme/ThemeContext";

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TAB_ICONS: Record<
  string,
  {
    focused: keyof typeof Ionicons.glyphMap;
    default: keyof typeof Ionicons.glyphMap;
  }
> = {
  HomeTab: { focused: "train", default: "train-outline" },
  SearchTab: { focused: "search", default: "search-outline" },
  LinesTab: { focused: "git-branch", default: "git-branch-outline" },
  MapTab: { focused: "map", default: "map-outline" },
  AlertsTab: { focused: "notifications", default: "notifications-outline" },
  ProfileTab: { focused: "person-circle", default: "person-circle-outline" },
  SettingsTab: { focused: "cog", default: "cog-outline" },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const TAB_HEIGHT = 60;
  const PILL_WIDTH = 320;
  const HORIZONTAL_MARGIN = (SCREEN_WIDTH - PILL_WIDTH) / 2;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: insets.bottom + 12,
          left: HORIZONTAL_MARGIN,
          width: PILL_WIDTH,
        },
      ]}
    >
      <BlurView intensity={85} style={styles.blurView}>
        <View
          style={[
            styles.tabBarContent,
            {
              backgroundColor: isDark
                ? "rgba(26, 26, 26, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const icons = TAB_ICONS[route.name];
            const iconName = isFocused ? icons.focused : icons.default;
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                preventDefault: false,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <View key={route.key} style={styles.tabItem}>
                <Ionicons
                  name={iconName}
                  size={22}
                  color={
                    isFocused
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                  onPress={onPress}
                  style={{ marginBottom: 2 }}
                />
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{ tabBarLabel: "Map" }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsStack}
        options={{ tabBarLabel: "Alerts" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: "Settings" }}
      />
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
  },
  blurView: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
  },
  tabBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
