import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  textColors,
  backgroundColors,
  primaryColors,
  illustrationColors,
  semanticColors,
  spacing,
  radius,
  headingStyles,
  bodyStyles,
  buttonSpec,
  fontWeight,
} from "@/theme/tokens";
import { CoordinateStep } from "./CoordinateStep";
import { NavigateStep } from "./NavigateStep";
import { UrgencyReminder } from "./UrgencyReminder";

interface RequestAcceptedScreenProps {
  requestId: Id<"requests">;
  requesterName: string;
  requesterPhone: string;
  location: string;
  address: string;
  urgency: string;
  onClose: () => void;
}

export function RequestAcceptedScreen({
  requestId,
  requesterName,
  requesterPhone,
  location,
  address,
  urgency,
  onClose,
}: RequestAcceptedScreenProps) {
  const cancelAcceptance = useMutation(api.requests.cancelRequest);

  const handleCall = () => {
    Linking.openURL(`tel:${requesterPhone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${requesterPhone}`);
  };

  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(`${location}, ${address}`);
    const url = Platform.select({
      ios: `maps:?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        );
      });
    }
  };

  const handleGoToDashboard = () => {
    onClose();
  };

  const handleCancelDonation = () => {
    Alert.alert(
      "Cancel Donation",
      "Are you sure you want to cancel your commitment to donate? The requester will be notified.",
      [
        { text: "No, Keep Commitment", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAcceptance({ requestId });
              onClose();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to cancel donation",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  // Map urgency string to typed urgency level
  const getUrgencyLevel = () => {
    if (urgency === "critical" || urgency === "urgent") {
      return urgency;
    }
    return "normal" as const;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.successCircle}>
            <Ionicons
              name="checkmark"
              size={48}
              color={semanticColors.success}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Request Accepted!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Thank you for volunteering. The requester has been notified.
        </Text>

        {/* Step 1: Coordinate */}
        <CoordinateStep
          name={requesterName}
          phone={requesterPhone}
          onCall={handleCall}
          onMessage={handleMessage}
        />

        {/* Step 2: Navigate */}
        <NavigateStep
          location={location}
          address={address}
          onGetDirections={handleGetDirections}
        />

        {/* Urgency Reminder */}
        <UrgencyReminder urgency={getUrgencyLevel()} />

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoToDashboard}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        {/* Cancel Donation Link */}
        <TouchableOpacity
          style={styles.cancelLink}
          onPress={handleCancelDonation}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelLinkText}>Cancel Donation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(8),
    paddingBottom: spacing(4),
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: spacing(6),
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: illustrationColors.greenCircle,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: headingStyles.pageTitle.fontSize,
    fontWeight: headingStyles.pageTitle.fontWeight,
    color: textColors.primary,
    textAlign: "center",
    marginBottom: spacing(2),
  },
  subtitle: {
    fontSize: bodyStyles.body.fontSize,
    fontWeight: bodyStyles.body.fontWeight,
    color: textColors.secondary,
    textAlign: "center",
    lineHeight: bodyStyles.body.lineHeight,
    marginBottom: spacing(8),
    paddingHorizontal: spacing(2),
  },
  spacer: {
    height: spacing(4),
  },
  bottomActions: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(8),
    paddingTop: spacing(4),
    backgroundColor: backgroundColors.background,
  },
  primaryButton: {
    height: buttonSpec.primary.height,
    borderRadius: buttonSpec.primary.borderRadius,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(3),
  },
  primaryButtonText: {
    fontSize: buttonSpec.primary.fontSize,
    fontWeight: fontWeight.semibold,
    color: textColors.onPrimary,
  },
  cancelLink: {
    paddingVertical: spacing(3),
    alignItems: "center",
  },
  cancelLinkText: {
    fontSize: bodyStyles.body.fontSize,
    fontWeight: fontWeight.medium,
    color: textColors.secondary,
  },
});
