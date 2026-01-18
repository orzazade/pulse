import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  primaryColors,
  textColors,
  headingStyles,
  bodyStyles,
  fontWeight,
  spacing,
} from "@/theme/tokens";

interface Donation {
  id: string;
  type: string;
  location: string;
  date: string;
}

interface DonationHistorySectionProps {
  donations: Donation[];
  onViewAllPress: () => void;
}

export function DonationHistorySection({
  donations,
  onViewAllPress,
}: DonationHistorySectionProps) {
  const hasDonations = donations.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Donation History</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Donation Items or Empty State */}
      {hasDonations ? (
        <View style={styles.donationsList}>
          {donations.map((donation) => (
            <View key={donation.id} style={styles.donationItem}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="water" size={20} color={primaryColors.primary} />
              </View>

              {/* Content */}
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{donation.type}</Text>
                <Text style={styles.itemSubtitle}>{donation.location}</Text>
              </View>

              {/* Date */}
              <Text style={styles.itemDate}>{donation.date}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No donations yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing(5),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(3),
  },
  sectionTitle: {
    ...headingStyles.cardTitle,
    color: textColors.primary,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: primaryColors.primary,
  },
  donationsList: {
    gap: spacing(3),
  },
  donationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: primaryColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3),
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: textColors.secondary,
  },
  itemDate: {
    fontSize: 13,
    color: textColors.tertiary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing(6),
  },
  emptyText: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
  },
});
