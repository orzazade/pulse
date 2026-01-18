/**
 * Tabs Layout - Main tab navigation with animated tab bar
 *
 * Uses custom AnimatedTabBar with sliding pill indicator.
 * Badge support for notifications count.
 */

import { Tabs } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

import { AnimatedTabBar } from "../../components/navigation/AnimatedTabBar";
import { colors, fontWeight } from "../../theme";

// Header styles using theme tokens
const headerStyle = {
  backgroundColor: colors.background,
};

const headerTitleStyle = {
  fontWeight: fontWeight.bold,
  color: colors.text.primary,
};

export default function TabsLayout() {
  // Get unread notification count for badge
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerStyle,
        headerTitleStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          headerShown: false, // Custom header in screen
          tabBarBadge: unreadCount && unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
