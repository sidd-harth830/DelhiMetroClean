import React, { useState, useEffect, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Text } from "react-native-paper";
import { Platform, Pressable, StyleSheet, View, Dimensions, LayoutAnimation, UIManager } from "react-native";
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
import { bentoRadius } from "../theme/colors";

// Enable LayoutAnimation on Android (only in Old Architecture where needed)
const isNewArch = !!(global as any).nativeFabricUIManager;
if (!isNewArch && Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  MapTab: { focused: "map", default: "map-outline" },
  AlertsTab: { focused: "notifications", default: "notifications-outline" },
  ProfileTab: { focused: "person-circle", default: "person-circle-outline" },
  SettingsTab: { focused: "cog", default: "cog-outline" },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const COLLAPSED_HEIGHT = 64;
  const EXPANDED_HEIGHT = 88;
  const PILL_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);
  const HORIZONTAL_MARGIN = (SCREEN_WIDTH - PILL_WIDTH) / 2;

  const handleTabPress = (route: any, index: number, isFocused: boolean) => {
    // Configure animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(true);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      preventDefault: false,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }

    // Reset timeout for auto-collapse
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(false);
    }, 4000); // 4 seconds before auto collapse
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: Math.max(insets.bottom, 12) + 8,
          left: HORIZONTAL_MARGIN,
          width: PILL_WIDTH,
        },
      ]}
    >
      <BlurView
        intensity={isDark ? 30 : 60}
        tint={isDark ? "dark" : "light"}
        style={styles.blurView}
      >
        <View
          style={[
            styles.tabBarContent,
            {
              backgroundColor: isDark
                ? "rgba(12, 12, 18, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.1)",
              height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
            },
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const icons = TAB_ICONS[route.name];
            const iconName = isFocused ? icons.focused : icons.default;
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route, index, isFocused)}
                style={styles.tabItem}
              >
                <View style={styles.iconContainer}>
                  {/* Active glow background */}
                  {isFocused && (
                    <View
                      style={[
                        styles.activeGlow,
                        {
                          backgroundColor: isDark
                            ? `${theme.colors.primary}25`
                            : `${theme.colors.primary}20`,
                        },
                      ]}
                    />
                  )}
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={
                      isFocused
                        ? theme.colors.primary
                        : isDark
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(0,0,0,0.5)"
                    }
                  />
                  {/* Active dot indicator (only in collapsed state) */}
                  {isFocused && !isExpanded && (
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                </View>
                {/* Expandable Label */}
                {isExpanded && (
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? theme.colors.primary : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
                        fontWeight: isFocused ? "bold" : "normal",
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function TabNavigator() {
  const theme = useTheme();

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
    zIndex: 50,
  },
  blurView: {
    flex: 1,
    borderRadius: bentoRadius.pill,
    overflow: "hidden",
  },
  tabBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: bentoRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeGlow: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
