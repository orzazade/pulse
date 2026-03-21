/**
 * Tabs Layout - Main tab navigation with animated tab bar
 *
 * Uses custom AnimatedTabBar with sliding pill indicator.
 * Badge support for notifications count.
 */

import { Tabs, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
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
  // All hooks must be called before any early return (React rules of hooks)
  const { isSignedIn, isLoaded } = useAuth();
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  // Auth guard: redirect to sign-in if session expires or user is not authenticated
  if (isLoaded && !isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

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
