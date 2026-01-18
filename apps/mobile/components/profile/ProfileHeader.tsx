import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  primaryColors,
  backgroundColors,
  textColors,
  headingStyles,
  bodyStyles,
  fontWeight,
  spacing,
  radius,
  shadows,
} from "@/theme/tokens";

interface ProfileHeaderProps {
  name: string;
  phone: string;
  memberSince: string;
  bloodType: string;
  avatarUrl?: string;
  onEditPress: () => void;
  onSettingsPress: () => void;
}

export function ProfileHeader({
  name,
  phone,
  memberSince,
  bloodType,
  avatarUrl,
  onEditPress,
  onSettingsPress,
}: ProfileHeaderProps) {
  // Get initials from name for avatar fallback
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      if (first && first.length > 0 && last && last.length > 0) {
        return (first.charAt(0) + last.charAt(0)).toUpperCase();
      }
    }
    if (fullName.length >= 2) {
      return fullName.slice(0, 2).toUpperCase();
    }
    return fullName.toUpperCase() || "?";
  };

  return (
    <View style={styles.container}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={textColors.secondary} />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          </View>

          {/* Blood Type Badge */}
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{bloodType}</Text>
          </View>
        </View>

        {/* Edit Profile Link */}
        <TouchableOpacity onPress={onEditPress} style={styles.editLinkContainer}>
          <Text style={styles.editLink}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(4),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(4),
  },
  pageTitle: {
    ...headingStyles.pageTitle,
    color: textColors.primary,
  },
  settingsButton: {
    padding: spacing(2),
  },
  card: {
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.medium,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: spacing(3),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: fontWeight.semibold,
    color: textColors.secondary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
    marginBottom: spacing(1),
  },
  userPhone: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
    marginBottom: spacing(1),
  },
  memberSince: {
    ...bodyStyles.caption,
    color: textColors.tertiary,
  },
  bloodBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodBadgeText: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: textColors.onPrimary,
  },
  editLinkContainer: {
    alignItems: "flex-end",
    marginTop: spacing(3),
  },
  editLink: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: primaryColors.primary,
  },
});
