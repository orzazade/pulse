import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { AlertsScreen } from "@/components/notifications/AlertsScreen";
import { primaryColors, backgroundColors } from "@/theme/tokens";

/**
 * Notifications Tab Screen
 *
 * Thin wrapper that:
 * 1. Fetches notifications data with useQuery
 * 2. Provides mutation handlers
 * 3. Renders AlertsScreen with data
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useQuery(api.notifications.getNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Handle notification press - mark as read and navigate
  const handleNotificationPress = async (notification: {
    _id: Id<"notifications">;
    type: string;
    data?: { requestId?: Id<"requests"> };
  }) => {
    // Mark as read
    try {
      await markAsRead({ notificationId: notification._id });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    // Navigate based on type
    if (
      (notification.type === "request_match" ||
        notification.type === "request_accepted") &&
      notification.data?.requestId
    ) {
      router.push("/requests");
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Compute hasUnread from notifications
  const hasUnread = notifications?.some((n: { read: boolean }) => !n.read) ?? false;

  // Loading state
  if (notifications === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
      </View>
    );
  }

  return (
    <AlertsScreen
      notifications={notifications}
      onNotificationPress={handleNotificationPress}
      onMarkAllRead={handleMarkAllAsRead}
      hasUnread={hasUnread}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: backgroundColors.background,
  },
});
