import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileHeader } from "./ProfileHeader";
import { StatsRow } from "./StatsRow";
import { EligibilitySection } from "./EligibilitySection";
import { AvailabilitySection } from "./AvailabilitySection";
import { DonationHistorySection } from "./DonationHistorySection";
import {
  backgroundColors,
  borderColors,
  spacing,
} from "@/theme/tokens";

interface Donation {
  id: string;
  type: string;
  location: string;
  date: string;
}

interface ProfileScreenProps {
  user: {
    name: string;
    phone: string;
    bloodType: string;
    memberSince: string;
    avatarUrl?: string;
  };
  stats: {
    donations: number;
    livesHelped: number;
    daysSince: number;
  };
  eligibility: {
    isEligible: boolean;
    daysUntilEligible?: number;
    subtitle?: string;
  };
  availability: {
    isAvailable: boolean;
  };
  donations: Donation[];
  onEditProfile: () => void;
  onSettings: () => void;
  onToggleAvailability: () => void;
  onViewAllDonations: () => void;
  isTogglingAvailability?: boolean;
}

export function ProfileScreen({
  user,
  stats,
  eligibility,
  availability,
  donations,
  onEditProfile,
  onSettings,
  onToggleAvailability,
  onViewAllDonations,
  isTogglingAvailability = false,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with User Info Card */}
        <ProfileHeader
          name={user.name}
          phone={user.phone}
          memberSince={user.memberSince}
          bloodType={user.bloodType}
          avatarUrl={user.avatarUrl}
          onEditPress={onEditProfile}
          onSettingsPress={onSettings}
        />

        {/* Stats Row */}
        <StatsRow
          donations={stats.donations}
          livesHelped={stats.livesHelped}
          daysSince={stats.daysSince}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Eligibility Section */}
        <View style={styles.sectionWrapper}>
          <EligibilitySection
            isEligible={eligibility.isEligible}
            daysUntilEligible={eligibility.daysUntilEligible}
            subtitle={eligibility.subtitle}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Availability Section */}
        <AvailabilitySection
          isAvailable={availability.isAvailable}
          onToggle={onToggleAvailability}
          isLoading={isTogglingAvailability}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Donation History Section */}
        <DonationHistorySection
          donations={donations}
          onViewAllPress={onViewAllDonations}
        />
      </ScrollView>
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
  contentContainer: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(8),
  },
  sectionWrapper: {
    paddingHorizontal: spacing(0),
  },
  divider: {
    height: 1,
    backgroundColor: borderColors.default,
    marginVertical: spacing(2),
  },
});
