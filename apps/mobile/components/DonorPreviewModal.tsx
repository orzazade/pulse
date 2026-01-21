import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";
import {
  primaryColors,
  backgroundColors,
  textColors,
  borderColors,
  fontWeight,
  spacing,
  radius,
  shadows,
  touchTargetSpec,
  iconSpec,
} from "@/theme/tokens";

interface Donor {
  _id: Id<"users">;
  bloodType?: string;
  city?: string;
  region?: string;
  isAvailable?: boolean;
}

interface DonorPreviewModalProps {
  visible: boolean;
  donor: Donor | null;
  onClose: () => void;
  onRequestBlood: () => void;
}

export function DonorPreviewModal({
  visible,
  donor,
  onClose,
  onRequestBlood,
}: DonorPreviewModalProps) {
  const locationText =
    donor?.city && donor?.region
      ? `${donor.city}, ${donor.region}`
      : donor?.city || donor?.region || "Location not specified";

  const isAvailable = donor?.isAvailable !== false;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Donor Details</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={iconSpec.md} color={textColors.primary} />
          </TouchableOpacity>
        </View>

        {donor ? (
          <View style={styles.content}>
            {/* Large blood type circle */}
            <View style={styles.bloodTypeContainer}>
              <View style={styles.bloodTypeCircle}>
                <Text style={styles.bloodTypeText}>
                  {donor.bloodType || "?"}
                </Text>
              </View>
            </View>

            {/* Availability badge */}
            <View
              style={[
                styles.availabilityBadge,
                isAvailable
                  ? styles.availableBadge
                  : styles.unavailableBadge,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  isAvailable
                    ? styles.availableText
                    : styles.unavailableText,
                ]}
              >
                {isAvailable ? "Available" : "Unavailable"}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text style={styles.locationText}>{locationText}</Text>
            </View>

            {/* Request Blood button */}
            <TouchableOpacity
              style={styles.requestButton}
              onPress={onRequestBlood}
              activeOpacity={0.8}
            >
              <Text style={styles.requestButtonText}>Request Blood</Text>
            </TouchableOpacity>

            {/* Note about privacy */}
            <Text style={styles.privacyNote}>
              Contact information will be shared only after the donor accepts
              your request.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donor selected</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.input,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
    backgroundColor: backgroundColors.background,
  },
  headerSpacer: {
    width: touchTargetSpec.minimum,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  closeButton: {
    width: touchTargetSpec.minimum,
    height: touchTargetSpec.minimum,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(6),
    alignItems: "center",
  },
  bloodTypeContainer: {
    marginTop: spacing(6),
    marginBottom: spacing(4),
  },
  bloodTypeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.medium,
  },
  bloodTypeText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: textColors.onPrimary,
  },
  availabilityBadge: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: 16,
    marginBottom: spacing(6),
  },
  availableBadge: {
    backgroundColor: "#dcfce7",
  },
  unavailableBadge: {
    backgroundColor: backgroundColors.chipInactive,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
  availableText: {
    color: "#22c55e",
  },
  unavailableText: {
    color: textColors.tertiary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(8),
    gap: spacing(2),
  },
  locationText: {
    fontSize: 16,
    color: textColors.primary,
  },
  requestButton: {
    backgroundColor: primaryColors.primary,
    width: "100%",
    height: touchTargetSpec.large,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(4),
    ...shadows.medium,
  },
  requestButtonText: {
    color: textColors.onPrimary,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
  },
  privacyNote: {
    fontSize: 13,
    color: textColors.secondary,
    textAlign: "center",
    paddingHorizontal: spacing(6),
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
