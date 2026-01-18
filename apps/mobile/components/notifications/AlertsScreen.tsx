import React, { useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  SectionListData,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  backgroundColors,
  textColors,
  primaryColors,
  headingStyles,
  bodyStyles,
  spacing,
} from "@/theme/tokens";
import { SectionHeader } from "./SectionHeader";
import { NotificationCard } from "./NotificationCard";
import { Id } from "@convex/_generated/dataModel";

type NotificationType =
  | "request_match"
  | "request_accepted"
  | "eligibility_reminder"
  | "thank_you"
  | "general";

interface NotificationData {
  _id: Id<"notifications">;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  data?: {
    requestId?: Id<"requests">;
  };
}

interface AlertsScreenProps {
  notifications: NotificationData[];
  onNotificationPress: (notification: NotificationData) => void;
  onMarkAllRead: () => void;
  hasUnread: boolean;
}

interface NotificationSection {
  title: string;
  data: NotificationData[];
}

/**
 * Group notifications by date (Today, Yesterday, or formatted date)
 */
function groupNotificationsByDate(
  notifications: NotificationData[]
): NotificationSection[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const groups: Record<string, NotificationData[]> = {};

  for (const notification of notifications) {
    const notifDate = new Date(notification.createdAt);
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );

    let groupKey: string;

    if (notifDay.getTime() === today.getTime()) {
      groupKey = "Today";
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groupKey = "Yesterday";
    } else {
      // Format as "January 15" for older dates
      groupKey = notifDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]!.push(notification);
  }

  // Convert to sections array with proper order
  const orderedKeys: string[] = [];

  // Today first
  if (groups["Today"]) orderedKeys.push("Today");
  // Yesterday second
  if (groups["Yesterday"]) orderedKeys.push("Yesterday");
  // Rest in order they appear (already sorted by createdAt from backend)
  Object.keys(groups).forEach((key) => {
    if (key !== "Today" && key !== "Yesterday" && !orderedKeys.includes(key)) {
      orderedKeys.push(key);
    }
  });

  return orderedKeys.map((key) => ({
    title: key,
    data: groups[key] ?? [],
  }));
}

/**
 * AlertsScreen component matching Notifications.png design
 * - "Alerts" title on left (bold, large)
 * - "Mark all read" link on right (red text)
 * - SectionList with grouped notifications by date
 * - Empty state with bell icon when no notifications
 */
export function AlertsScreen({
  notifications,
  onNotificationPress,
  onMarkAllRead,
  hasUnread,
}: AlertsScreenProps) {
  const insets = useSafeAreaInsets();

  // Group notifications by date
  const sections = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<NotificationData, NotificationSection>;
  }) => <SectionHeader title={section.title} />;

  const renderItem = ({ item }: { item: NotificationData }) => (
    <View style={styles.cardContainer}>
      <NotificationCard
        notification={item}
        onPress={() => onNotificationPress(item)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={64}
        color={textColors.tertiary}
      />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You'll see notifications here when donors respond to your requests or
        when you're eligible to donate again.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        {hasUnread && (
          <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background, // #FFFFFF
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5), // 20px
    paddingTop: spacing(4), // 16px
    paddingBottom: spacing(2), // 8px
  },
  headerTitle: {
    ...headingStyles.pageTitle,
    color: textColors.primary, // #1F2937
  },
  markAllReadText: {
    ...bodyStyles.label,
    color: primaryColors.primary, // #E53935
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  cardContainer: {
    paddingHorizontal: spacing(5), // 20px
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing(10), // 40px
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: textColors.primary,
    marginTop: spacing(4), // 16px
    marginBottom: spacing(2), // 8px
  },
  emptySubtitle: {
    fontSize: 14,
    color: textColors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
