import React, { useRef, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Text } from "react-native-paper";
import { Animated, Pressable, StyleSheet, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { HomeStack } from "./HomeStack";
import { ExploreStack } from "./ExploreStack";
import { LinesStack } from "./LinesStack";
import { MapStack } from "./MapStack";
import { AlertsStack } from "./AlertsStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SavedRoutesScreen } from "../screens/SavedRoutesScreen";
import { FavoriteStationsScreen } from "../screens/FavoriteStationsScreen";
import { ApiPortalScreen } from "../screens/ApiPortalScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { useAppTheme } from "../theme/ThemeContext";
import { bentoRadius } from "../theme/colors";

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
  ApiTab: { focused: "code-slash", default: "code-slash-outline" },
};

/**
 * Each tab item uses Animated API (NOT LayoutAnimation) to smoothly
 * transition the pill background. LayoutAnimation on Android was the
 * root cause of the rectangular-pill bug — it animated the flex change
 * without properly preserving borderRadius during the transition.
 */
function TabItem({ route, isFocused, descriptors, onPress, isDark, theme }: {
  route: any;
  isFocused: boolean;
  descriptors: any;
  onPress: () => void;
  isDark: boolean;
  theme: any;
}) {
  const anim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      friction: 10,
      tension: 80,
    }).start();
  }, [isFocused]);

  const { options } = descriptors[route.key];
  const icons = TAB_ICONS[route.name];
  const iconName = isFocused ? icons.focused : icons.default;
  const label = options.tabBarLabel ?? options.title ?? route.name;

  const pillBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'transparent',
      isDark ? "rgba(190, 255, 108, 0.12)" : "rgba(21, 128, 61, 0.08)",
    ],
  });

  const pillBorderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'transparent',
      isDark ? "rgba(190, 255, 108, 0.2)" : "rgba(21, 128, 61, 0.15)",
    ],
  });

  const labelOpacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Animated.View
        style={[
          styles.itemPill,
          {
            backgroundColor: pillBg,
            borderColor: pillBorderColor,
            borderWidth: 1,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={
            isFocused
              ? theme.colors.primary
              : isDark
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(0, 0, 0, 0.4)"
          }
        />
        {isFocused && (
          <Animated.View style={{ opacity: labelOpacity }}>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: theme.colors.primary,
                  fontWeight: "700",
                  marginLeft: 6,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const TAB_BAR_HEIGHT = 68;
  const PILL_WIDTH = Math.min(SCREEN_WIDTH - 24, 400);
  const HORIZONTAL_MARGIN = (SCREEN_WIDTH - PILL_WIDTH) / 2;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: Math.max(insets.bottom, 12) + 4,
          left: HORIZONTAL_MARGIN,
          width: PILL_WIDTH,
        },
      ]}
    >
      <BlurView
        intensity={isDark ? 50 : 80}
        tint={isDark ? "dark" : "light"}
        style={styles.blurView}
      >
        <View
          style={[
            styles.tabBarContent,
            {
              backgroundColor: isDark
                ? "rgba(15, 15, 20, 0.95)"
                : "rgba(252, 252, 254, 0.95)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.06)",
              height: TAB_BAR_HEIGHT,
            },
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            return (
              <TabItem
                key={route.key}
                route={route}
                isFocused={isFocused}
                descriptors={descriptors}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    preventDefault: false,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                isDark={isDark}
                theme={theme}
              />
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
        name="ApiTab"
        component={ApiPortalScreen}
        options={{ tabBarLabel: "API" }}
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
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="ExploreStack" component={ExploreStack} />
      <Stack.Screen name="LinesStack" component={LinesStack} />
      <Stack.Screen
        name="SavedRoutes"
        component={SavedRoutesScreen}
        options={{
          headerShown: true,
          title: 'Saved Routes',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="FavoriteStations"
        component={FavoriteStationsScreen}
        options={{
          headerShown: true,
          title: 'Favorite Stations',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
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
    paddingHorizontal: 6,
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 2,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    height: 38,
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
