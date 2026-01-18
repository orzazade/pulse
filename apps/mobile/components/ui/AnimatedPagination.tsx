/**
 * AnimatedPagination Component - Pagination with sliding pill indicator
 *
 * Features:
 * - Red pill indicator (24px wide, 8px tall) that slides between positions
 * - Gray inactive dots (8px circles)
 * - Spring animation for smooth transitions
 * - Uses built-in React Native Animated API (not reanimated)
 * - Supports any number of dots
 *
 * Usage:
 *   <AnimatedPagination total={3} current={currentIndex} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

import { paginationSpec, spacing } from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

interface AnimatedPaginationProps {
  /** Total number of pages/dots */
  total: number;
  /** Current active index (0-based) */
  current: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DOT_SIZE = paginationSpec.inactive.size; // 8px
const PILL_WIDTH = paginationSpec.active.width; // 24px
const PILL_HEIGHT = paginationSpec.active.height; // 8px
const DOT_GAP = spacing(2); // 8px gap between dots

/**
 * Calculate the X position of the pill for a given index
 * Each dot position: index * (DOT_SIZE + DOT_GAP)
 * Pill is wider than dot, so we offset to center it
 */
const getPillPosition = (index: number) => {
  const dotPosition = index * (DOT_SIZE + DOT_GAP);
  // No offset needed since pill starts from same position as dot
  return dotPosition;
};

// =============================================================================
// ANIMATED PAGINATION COMPONENT
// =============================================================================

export function AnimatedPagination({ total, current }: AnimatedPaginationProps) {
  const translateX = useRef(new Animated.Value(getPillPosition(current))).current;

  // Animate pill position when current index changes
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: getPillPosition(current),
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [current, translateX]);

  // Calculate total width for container
  // Width = (DOT_SIZE * total) + (DOT_GAP * (total - 1))
  const containerWidth = DOT_SIZE * total + DOT_GAP * (total - 1);

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {/* Inactive dots layer */}
      <View style={styles.dotsRow}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < total - 1 && { marginRight: DOT_GAP },
            ]}
          />
        ))}
      </View>

      {/* Animated pill indicator (overlays the active dot) */}
      <Animated.View
        style={[
          styles.pill,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: paginationSpec.inactive.borderRadius,
    backgroundColor: paginationSpec.inactive.backgroundColor,
  },

  pill: {
    position: 'absolute',
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: paginationSpec.active.borderRadius,
    backgroundColor: paginationSpec.active.backgroundColor,
  },
});

export default AnimatedPagination;
