import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  backgroundColors,
  textColors,
  primaryColors,
  semanticColors,
  borderColors,
  spacing,
  radius,
  shadows,
} from "@/theme/tokens";
import { UrgencyBanner } from "./requests/UrgencyBanner";
import { RequesterCard } from "./requests/RequesterCard";
import { LocationCard } from "./requests/LocationCard";
import { TimelineInfoCard } from "./requests/TimelineInfoCard";
import { RequestAcceptedScreen } from "./requests/RequestAcceptedScreen";

interface RequestDetailModalProps {
  visible: boolean;
  requestId: Id<"requests"> | null;
  onClose: () => void;
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
    return `Tomorrow`;
  }

  // Standard - within a week
  return `Within 7 days`;
}

export function RequestDetailModal({
  visible,
  requestId,
  onClose,
}: RequestDetailModalProps) {
  const [showAcceptedScreen, setShowAcceptedScreen] = useState(false);
  const [acceptedRequestData, setAcceptedRequestData] = useState<{
    requesterName: string;
    requesterPhone: string;
    location: string;
    address: string;
    urgency: string;
  } | null>(null);

  const detail = useQuery(
    api.requests.getRequestDetail,
    requestId ? { requestId } : "skip"
  );
  const acceptRequest = useMutation(api.requests.acceptRequest);
  const cancelRequest = useMutation(api.requests.cancelRequest);

  const isLoading = requestId && detail === undefined;

  // Handle close - reset accepted screen state
  const handleClose = () => {
    setShowAcceptedScreen(false);
    setAcceptedRequestData(null);
    onClose();
  };

  const handleAccept = async () => {
    if (!requestId || !detail) return;
    try {
      await acceptRequest({ requestId });
      // Show the Request Accepted screen with seeker info
      setAcceptedRequestData({
        requesterName: detail.seeker?.fullName || detail.seeker?.phone || "Requester",
        requesterPhone: detail.seeker?.phone || "",
        location: detail.hospital || detail.city || "Hospital",
        address: detail.city || "",
        urgency: detail.urgency,
      });
      setShowAcceptedScreen(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to accept request",
        [{ text: "OK" }]
      );
    }
  };

  const handleCancel = async () => {
    if (!requestId) return;
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelRequest({ requestId });
              handleClose();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to cancel request",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // If showing accepted screen, render that instead
  if (showAcceptedScreen && acceptedRequestData && requestId) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container}>
          <RequestAcceptedScreen
            requestId={requestId}
            requesterName={acceptedRequestData.requesterName}
            requesterPhone={acceptedRequestData.requesterPhone}
            location={acceptedRequestData.location}
            address={acceptedRequestData.address}
            urgency={acceptedRequestData.urgency}
            onClose={handleClose}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={textColors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColors.primary} />
          </View>
        ) : detail ? (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Urgency Banner */}
              <View style={styles.bannerContainer}>
                <UrgencyBanner urgency={mapUrgency(detail.urgency)} />
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

              {/* Contact info for accepted requests */}
              {detail.status === "accepted" && detail.isSeeker && detail.donor?.phone && (
                <View style={styles.contactCard}>
                  <Text style={styles.contactLabel}>Donor found! Contact them:</Text>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(detail.donor!.phone!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>{detail.donor.phone}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {detail.status === "accepted" && detail.isDonor && detail.seeker?.phone && (
                <View style={styles.contactCard}>
                  <Text style={styles.contactLabel}>
                    You accepted this request. Contact the seeker:
                  </Text>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(detail.seeker!.phone!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>{detail.seeker.phone}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Completed/Cancelled status */}
              {(detail.status === "completed" || detail.status === "cancelled") && (
                <View style={styles.closedContainer}>
                  <Ionicons
                    name={detail.status === "completed" ? "checkmark-circle" : "close-circle"}
                    size={32}
                    color={detail.status === "completed" ? semanticColors.success : primaryColors.primary}
                  />
                  <Text style={styles.closedText}>
                    This request has been {detail.status}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons - Fixed at bottom */}
            {detail.status === "open" && (
              <View style={styles.actionContainer}>
                {/* Donor viewing open request */}
                {!detail.isSeeker && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={handleAccept}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.acceptButtonText}>Accept Request</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Seeker viewing their own request */}
                {detail.isSeeker && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Request</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Request not found</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
  contactCard: {
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginTop: spacing(3),
    alignItems: "center",
    ...shadows.light,
  },
  contactLabel: {
    fontSize: 15,
    color: textColors.primary,
    marginBottom: spacing(3),
    textAlign: "center",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: semanticColors.success,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  callButtonText: {
    color: textColors.onPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  closedContainer: {
    alignItems: "center",
    gap: spacing(3),
    marginTop: spacing(5),
    padding: spacing(4),
  },
  closedText: {
    fontSize: 15,
    color: textColors.secondary,
    textAlign: "center",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: textColors.secondary,
  },
});
