import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  backgroundColors,
  textColors,
  primaryColors,
  borderColors,
  spacing,
  radius,
  shadows,
} from "@/theme/tokens";
import { UrgencyBanner } from "./UrgencyBanner";
import { RequesterCard } from "./RequesterCard";
import { LocationCard } from "./LocationCard";
import { TimelineInfoCard } from "./TimelineInfoCard";

interface RequestDetailsScreenProps {
  requestId: Id<"requests">;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

/**
 * Map urgency string to UrgencyBanner urgency level
 */
function mapUrgency(urgency: string): "critical" | "urgent" | "standard" {
  if (urgency === "critical") return "critical";
  if (urgency === "urgent") return "urgent";
  return "standard";
}

/**
 * Format date for "Needed by" display
 */
function formatNeededBy(urgency: string): string {
  const now = new Date();

  if (urgency === "critical") {
    // Same day
    const hours = now.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `Today, ${displayHour}:00 ${period}`;
  }

  if (urgency === "urgent") {
    // 1-2 days
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Tomorrow`;
  }

  // Standard - within a week
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return `Within 7 days`;
}

export function RequestDetailsScreen({
  requestId,
  onClose,
  onAccept,
  onDecline,
  onCancel,
}: RequestDetailsScreenProps) {
  const detail = useQuery(api.requests.getRequestDetail, { requestId });

  // Loading state
  if (detail === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={textColors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (detail === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={textColors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const urgencyLevel = mapUrgency(detail.urgency);
  const isOpenRequest = detail.status === "open";
  const isDonorViewing = !detail.isSeeker && isOpenRequest;
  const isSeekerViewing = detail.isSeeker && isOpenRequest;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={textColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgency Banner */}
        <View style={styles.bannerContainer}>
          <UrgencyBanner urgency={urgencyLevel} />
        </View>

        {/* Blood Type Badge */}
        <View style={styles.bloodBadgeContainer}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{detail.bloodType}</Text>
          </View>
          <Text style={styles.unitsNeededText}>
            {detail.units || 1} unit{(detail.units || 1) !== 1 ? "s" : ""} needed
          </Text>
        </View>

        {/* Requester Card */}
        <View style={styles.cardContainer}>
          <RequesterCard
            name={detail.seeker?.fullName || detail.seeker?.phone || "Anonymous"}
            postedAt={detail.createdAt}
          />
        </View>

        {/* Location Card */}
        {(detail.hospital || detail.city) && (
          <View style={styles.cardContainer}>
            <LocationCard
              location={detail.hospital || "Hospital"}
              city={detail.city}
            />
          </View>
        )}

        {/* Timeline Info Card */}
        <View style={styles.cardContainer}>
          <TimelineInfoCard
            neededBy={formatNeededBy(detail.urgency)}
            bloodType={detail.bloodType}
            units={detail.units || 1}
          />
        </View>

        {/* Notes if present */}
        {detail.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Additional Notes</Text>
            <Text style={styles.notesText}>{detail.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionContainer}>
        {/* Donor viewing open request */}
        {isDonorViewing && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onDecline || onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seeker viewing their own request */}
        {isSeekerViewing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4), // 16px
    paddingVertical: spacing(3), // 12px
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
    backgroundColor: backgroundColors.background,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: textColors.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: textColors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(5), // 20px
    paddingBottom: spacing(6), // 24px
  },
  bannerContainer: {
    marginTop: spacing(5), // 20px
    marginBottom: spacing(5), // 20px
  },
  bloodBadgeContainer: {
    alignItems: "center",
    marginBottom: spacing(5), // 20px
  },
  bloodBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(2), // 8px
    ...shadows.medium,
  },
  bloodBadgeText: {
    fontSize: 28,
    fontWeight: "700",
    color: textColors.onPrimary,
  },
  unitsNeededText: {
    fontSize: 16,
    color: textColors.primary,
    fontWeight: "500",
  },
  cardContainer: {
    marginBottom: spacing(3), // 12px
  },
  notesCard: {
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginTop: spacing(1),
    ...shadows.light,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: textColors.secondary,
    marginBottom: spacing(2),
  },
  notesText: {
    fontSize: 14,
    color: textColors.primary,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: spacing(5), // 20px
    paddingVertical: spacing(4), // 16px
    paddingBottom: spacing(6), // 24px for safe area
    borderTopWidth: 1,
    borderTopColor: borderColors.default,
    backgroundColor: backgroundColors.background,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing(3), // 12px
  },
  declineButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: backgroundColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.primary,
  },
  acceptButton: {
    flex: 1.5,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.onPrimary,
  },
  cancelButton: {
    width: "100%",
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: backgroundColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.primary,
  },
});
