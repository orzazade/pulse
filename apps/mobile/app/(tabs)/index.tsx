import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Design tokens
import {
  primaryColors,
  backgroundColors,
  textColors,
  headingStyles,
  bodyStyles,
  shadows,
  radius,
  spacing,
} from "@/theme/tokens";

// Home components
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { QuickActionButton } from "@/components/home/QuickActionButton";
import { EmergencyBroadcastButton } from "@/components/home/EmergencyBroadcastButton";
import { RequestCard } from "@/components/RequestCard";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Queries
  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(api.users.getUserStats);
  const homeFeedRequests = useQuery(api.requests.getHomeFeedRequests);

  // Mutations
  const createRequest = useMutation(api.requests.createRequest);

  // Derived state
  const firstName = currentUser?.fullName?.split(" ")[0] || "User";
  const helpedCount = userStats?.helpedCount || 0;
  const bloodType = currentUser?.bloodType || "?";
  const isLoading = currentUser === undefined;

  const handleRequestPress = (requestId: Id<"requests">) => {
    console.log("Request pressed:", requestId);
    // Future: navigate to request detail
  };

  const handleEmergencyBroadcast = async () => {
    if (!currentUser?.bloodType) {
      console.log("No blood type set");
      return;
    }

    try {
      await createRequest({
        bloodType: currentUser.bloodType,
        urgency: "urgent",
        notes: "Emergency broadcast request",
      });
      console.log("Emergency broadcast sent");
    } catch (error) {
      console.error("Failed to send emergency broadcast:", error);
    }
  };

  const renderRequestItem = ({
    item,
  }: {
    item: NonNullable<typeof homeFeedRequests>[number];
  }) => (
    <RequestCard
      request={item}
      variant="donor"
      onPress={() => handleRequestPress(item._id)}
    />
  );

  const renderRequestsFeed = () => {
    if (homeFeedRequests === undefined) {
      return (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="small" color={primaryColors.primary} />
        </View>
      );
    }

    if (homeFeedRequests.length === 0) {
      return (
        <View style={styles.emptyFeed}>
          <Ionicons name="heart-outline" size={48} color={textColors.tertiary} />
          <Text style={styles.emptyFeedText}>
            No requests matching your blood type
          </Text>
          <Text style={styles.emptyFeedSecondary}>
            Requests matching your blood type will appear here
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={homeFeedRequests}
        keyExtractor={(item) => item._id}
        renderItem={renderRequestItem}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.feedListContent}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Title and Notification Dot */}
        <View style={styles.header}>
          <Text style={styles.title}>Home</Text>
          <View style={styles.notificationDot} />
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeSection}>
          <WelcomeCard
            firstName={firstName}
            helpedCount={helpedCount}
            bloodType={bloodType}
          />
        </View>

        {/* Quick Actions - Two Buttons */}
        <View style={styles.quickActionsSection}>
          <QuickActionButton
            label="Find Donors"
            icon={<Ionicons name="search" size={24} color={primaryColors.primary} />}
            onPress={() => router.push("/search")}
          />
          <View style={styles.quickActionSpacer} />
          <QuickActionButton
            label="Post Request"
            icon={<Ionicons name="add-circle" size={24} color={primaryColors.primary} />}
            onPress={() => router.push("/requests")}
          />
        </View>

        {/* Active Requests Section */}
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Requests</Text>
            <TouchableOpacity onPress={() => router.push("/requests")}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {renderRequestsFeed()}
        </View>
      </ScrollView>

      {/* Fixed Emergency Broadcast Button */}
      <View style={[styles.emergencyButtonContainer, { paddingBottom: insets.bottom + spacing(2) }]}>
        <EmergencyBroadcastButton
          onPress={handleEmergencyBroadcast}
          disabled={!currentUser?.bloodType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(20), // Space for emergency button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing(4),
    marginBottom: spacing(6),
  },
  title: {
    ...headingStyles.pageTitle,
    color: textColors.primary,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColors.primary,
  },
  welcomeSection: {
    marginBottom: spacing(6),
  },
  quickActionsSection: {
    flexDirection: "row",
    marginBottom: spacing(6),
  },
  quickActionSpacer: {
    width: spacing(3),
  },
  requestsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing(4),
  },
  sectionTitle: {
    ...headingStyles.sectionTitle,
    color: textColors.primary,
  },
  seeAllLink: {
    ...bodyStyles.bodySmall,
    color: primaryColors.primary,
    fontWeight: "600",
  },
  feedLoading: {
    paddingVertical: spacing(10),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFeed: {
    paddingVertical: spacing(12),
    alignItems: "center",
  },
  emptyFeedText: {
    ...bodyStyles.body,
    color: textColors.secondary,
    marginTop: spacing(5),
    textAlign: "center",
  },
  emptyFeedSecondary: {
    ...bodyStyles.bodySmall,
    color: textColors.tertiary,
    marginTop: spacing(2),
    textAlign: "center",
  },
  feedListContent: {
    paddingBottom: spacing(6),
  },
  emergencyButtonContainer: {
    position: "absolute",
    left: spacing(4),
    right: spacing(4),
    bottom: 0,
    backgroundColor: backgroundColors.background,
    paddingTop: spacing(2),
  },
});
