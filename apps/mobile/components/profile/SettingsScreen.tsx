import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  primaryColors,
  backgroundColors,
  textColors,
  borderColors,
  fontWeight,
  spacing,
  headingStyles,
  bodyStyles,
} from "@/theme/tokens";

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

export function SettingsScreen({
  onBack,
  onSignOut,
  isSigningOut = false,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={isSigningOut}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isSigningOut ? textColors.tertiary : textColors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Sign Out Option */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={onSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={primaryColors.primary} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
  },
  backButton: {
    padding: spacing(1),
  },
  headerTitle: {
    fontSize: headingStyles.cardTitle.fontSize,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  headerSpacer: {
    width: 32, // Match back button width for centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing(4),
  },
  signOutButton: {
    paddingVertical: spacing(4),
    alignItems: "center",
  },
  signOutText: {
    fontSize: bodyStyles.body.fontSize,
    fontWeight: fontWeight.medium,
    color: primaryColors.primary,
  },
});
