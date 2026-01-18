import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 56-day cycle constant for progress calculation
const DONATION_CYCLE_DAYS = 56;

interface EligibilityData {
  isEligible: boolean;
  daysUntilEligible: number;
  lastDonationDate: number | null;
  nextEligibleDate: number | null;
  daysSinceLastDonation: number | null;
}

interface EligibilityCardProps {
  eligibilityData: EligibilityData;
}

export function EligibilityCard({ eligibilityData }: EligibilityCardProps) {
  const {
    isEligible,
    daysUntilEligible,
    lastDonationDate,
    nextEligibleDate,
    daysSinceLastDonation,
  } = eligibilityData;

  // Format date to readable string
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate progress percentage (0-100)
  const getProgressPercentage = (): number => {
    if (isEligible || daysSinceLastDonation === null) {
      return 100;
    }
    return Math.min(100, (daysSinceLastDonation / DONATION_CYCLE_DAYS) * 100);
  };

  const progressPercentage = getProgressPercentage();

  // Determine if first-time donor
  const isFirstTimeDonor = lastDonationDate === null;

  return (
    <View
      style={[
        styles.container,
        isEligible ? styles.containerEligible : styles.containerNotEligible,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            isEligible ? styles.iconEligible : styles.iconNotEligible,
          ]}
        >
          <Ionicons
            name={isEligible ? "checkmark-circle" : "time"}
            size={24}
            color={isEligible ? "#16a34a" : "#ea580c"}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Donation Eligibility</Text>
          <Text
            style={[
              styles.status,
              isEligible ? styles.statusEligible : styles.statusNotEligible,
            ]}
          >
            {isEligible ? "You can donate!" : `${daysUntilEligible} days until eligible`}
          </Text>
        </View>
      </View>

      {/* Eligibility details */}
      <View style={styles.details}>
        {isFirstTimeDonor ? (
          <Text style={styles.detailText}>
            First time donor - you're ready to make a difference!
          </Text>
        ) : (
          <>
            <Text style={styles.detailText}>
              Last donation: {formatDate(lastDonationDate!)}
            </Text>
            {daysSinceLastDonation !== null && (
              <Text style={styles.detailText}>
                {daysSinceLastDonation} days since last donation
              </Text>
            )}
          </>
        )}
      </View>

      {/* Progress bar - only show if not eligible and has previous donation */}
      {!isEligible && !isFirstTimeDonor && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {Math.round(progressPercentage)}% complete
            </Text>
            {nextEligibleDate && (
              <Text style={styles.progressLabel}>
                Eligible: {formatDate(nextEligibleDate)}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerEligible: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  containerNotEligible: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconEligible: {
    backgroundColor: "#dcfce7",
  },
  iconNotEligible: {
    backgroundColor: "#ffedd5",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  status: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusEligible: {
    color: "#16a34a",
  },
  statusNotEligible: {
    color: "#ea580c",
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ea580c",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
});
