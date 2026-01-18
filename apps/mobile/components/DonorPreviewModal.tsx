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
            <Ionicons name="close" size={24} color="#374151" />
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
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  bloodTypeContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  bloodTypeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  bloodTypeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  availabilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  availableBadge: {
    backgroundColor: "#dcfce7",
  },
  unavailableBadge: {
    backgroundColor: "#f3f4f6",
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  availableText: {
    color: "#22c55e",
  },
  unavailableText: {
    color: "#9ca3af",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#374151",
  },
  requestButton: {
    backgroundColor: "#dc2626",
    width: "100%",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  privacyNote: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});
