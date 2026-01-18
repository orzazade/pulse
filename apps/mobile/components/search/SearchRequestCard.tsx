import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  backgroundColors,
  textColors,
  primaryColors,
  shadows,
  radius,
  spacing,
  headingStyles,
  bodyStyles,
  fontWeight,
} from '@/theme/tokens';

// Blood type badge background colors based on blood type
const getBloodTypeBadgeColors = (bloodType: string) => {
  // A and AB types get light red
  if (bloodType.startsWith('A')) {
    return {
      backgroundColor: '#FEE2E2',
      textColor: primaryColors.primary,
    };
  }
  // O types get light gray
  if (bloodType.startsWith('O')) {
    return {
      backgroundColor: '#F3F4F6',
      textColor: textColors.secondary,
    };
  }
  // B types get light pink
  return {
    backgroundColor: '#FCE7F3',
    textColor: textColors.secondary,
  };
};

// Format relative time (e.g., "15 min ago", "2 hrs ago")
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hrs ago`;
  return `${diffDays} days ago`;
};

export interface SearchRequest {
  _id: string;
  bloodType: string;
  title?: string;
  location?: string;
  city?: string;
  distance?: number;
  createdAt: number;
  urgency: 'normal' | 'urgent';
  notes?: string;
}

interface SearchRequestCardProps {
  request: SearchRequest;
  onPress: () => void;
}

export function SearchRequestCard({ request, onPress }: SearchRequestCardProps) {
  const badgeColors = getBloodTypeBadgeColors(request.bloodType);
  const isUrgent = request.urgency === 'urgent';

  // Generate title from blood type if not provided
  const title = request.title || `${request.bloodType} Blood Needed`;

  // Format location/subtitle
  const subtitle = request.location || request.city || 'Location not specified';

  // Format distance
  const distanceText = request.distance !== undefined
    ? `${request.distance.toFixed(1)} km away`
    : null;

  // Format time
  const timeText = formatRelativeTime(request.createdAt);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Blood type badge */}
      <View style={[styles.badge, { backgroundColor: badgeColors.backgroundColor }]}>
        <Text style={[styles.badgeText, { color: badgeColors.textColor }]}>
          {request.bloodType}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title row with urgent badge */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>

        {/* Subtitle (location) */}
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>

        {/* Bottom row: distance + time */}
        <Text style={styles.meta}>
          {distanceText ? `${distanceText} \u2022 ${timeText}` : timeText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginBottom: spacing(3),
    ...shadows.medium,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing(3),
  },
  badgeText: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  title: {
    ...headingStyles.cardTitle,
    color: textColors.primary,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: primaryColors.primary,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
    borderRadius: radius.sm,
    marginLeft: spacing(2),
  },
  urgentText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: textColors.onPrimary,
  },
  subtitle: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
    marginBottom: spacing(1),
  },
  meta: {
    ...bodyStyles.caption,
    color: textColors.tertiary,
  },
});
