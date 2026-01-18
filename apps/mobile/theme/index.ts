/**
 * Theme Module - Pulse Mobile App
 *
 * Central export for all design tokens and theme utilities.
 * Provides type-safe access to the design system.
 *
 * Usage:
 *   import { theme, colors, spacing, ... } from '@/theme';
 */

import {
  colors,
  primaryColors,
  backgroundColors,
  textColors,
  semanticColors,
  illustrationColors,
  borderColors,
  typography,
  fontFamily,
  fontWeight,
  headingStyles,
  bodyStyles,
  specialStyles,
  spacing,
  radius,
  shadows,
  buttonSpec,
  inputSpec,
  bloodTypeBadgeSpec,
  bloodTypeChipSpec,
  filterChipSpec,
  requestCardSpec,
  tabBarSpec,
  paginationSpec,
} from './tokens';

// =============================================================================
// THEME TYPE DEFINITIONS
// =============================================================================

/**
 * Theme structure for type-safe access
 */
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  components: {
    button: typeof buttonSpec;
    input: typeof inputSpec;
    bloodTypeBadge: typeof bloodTypeBadgeSpec;
    bloodTypeChip: typeof bloodTypeChipSpec;
    filterChip: typeof filterChipSpec;
    requestCard: typeof requestCardSpec;
    tabBar: typeof tabBarSpec;
    pagination: typeof paginationSpec;
  };
}

// =============================================================================
// DEFAULT THEME
// =============================================================================

/**
 * Default light theme combining all tokens
 * This is the primary theme for the app, extracted from PNG designs.
 */
export const theme: Theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  components: {
    button: buttonSpec,
    input: inputSpec,
    bloodTypeBadge: bloodTypeBadgeSpec,
    bloodTypeChip: bloodTypeChipSpec,
    filterChip: filterChipSpec,
    requestCard: requestCardSpec,
    tabBar: tabBarSpec,
    pagination: paginationSpec,
  },
};

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Color exports
export {
  colors,
  primaryColors,
  backgroundColors,
  textColors,
  semanticColors,
  illustrationColors,
  borderColors,
};

// Typography exports
export {
  typography,
  fontFamily,
  fontWeight,
  headingStyles,
  bodyStyles,
  specialStyles,
};

// Layout exports
export { spacing, radius, shadows };

// Component specification exports
export {
  buttonSpec,
  inputSpec,
  bloodTypeBadgeSpec,
  bloodTypeChipSpec,
  filterChipSpec,
  requestCardSpec,
  tabBarSpec,
  paginationSpec,
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Spacing key type */
export type SpacingKey = keyof typeof spacing;

/** Radius key type */
export type RadiusKey = keyof typeof radius;

/** Shadow key type */
export type ShadowKey = keyof typeof shadows;

/** Font weight key type */
export type FontWeightKey = keyof typeof fontWeight;

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default theme;
