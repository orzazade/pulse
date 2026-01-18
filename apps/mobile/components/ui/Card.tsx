/**
 * Card Component - Container with shadow and optional urgent styling
 *
 * Features:
 * - Standard padding and border radius (12px)
 * - Medium shadow by default
 * - Optional urgent variant (red left border)
 * - Pressable variant with touch feedback
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  shadows,
  requestCardSpec,
} from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export type CardVariant = 'default' | 'urgent';
export type ShadowLevel = 'none' | 'light' | 'medium' | 'large';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: CardVariant;
  /** Shadow level */
  shadow?: ShadowLevel;
  /** Make card pressable */
  pressable?: boolean;
  /** Press handler (only works if pressable=true) */
  onPress?: () => void;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Disabled state (only for pressable cards) */
  disabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Card({
  children,
  variant = 'default',
  shadow = 'medium',
  pressable = false,
  onPress,
  style,
  disabled = false,
}: CardProps) {
  const cardStyle = [
    styles.container,
    shadows[shadow],
    variant === 'urgent' && styles.urgent,
    style,
  ];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: requestCardSpec.backgroundColor,
    borderRadius: requestCardSpec.borderRadius, // 12px
    padding: requestCardSpec.padding, // 16px
  },

  urgent: {
    borderLeftWidth: requestCardSpec.urgentBorderWidth, // 4px
    borderLeftColor: requestCardSpec.urgentBorderColor, // primary red
  },
});

export default Card;
