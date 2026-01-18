/**
 * Design Tokens for Pulse Mobile App
 *
 * Extracted from PNG mockups in .planning/designs/screens/
 * These tokens define the visual language for 95%+ design fidelity.
 *
 * Usage:
 *   import { colors, typography, spacing, radius, shadows } from '@/theme/tokens';
 */

// =============================================================================
// COLORS
// =============================================================================

/**
 * Primary Colors - Used for CTAs, blood badges, urgent indicators, tab bar active
 */
export const primaryColors = {
  /** Primary red for buttons, badges, active states */
  primary: '#E53935',
  /** Light red for selected backgrounds, urgent card backgrounds */
  primaryLight: '#FEE2E2',
  /** Dark red for pressed/hover states */
  primaryDark: '#C62828',
} as const;

/**
 * Background Colors
 */
export const backgroundColors = {
  /** Pure white for screens */
  background: '#FFFFFF',
  /** White for cards (with shadow) */
  card: '#FFFFFF',
  /** Very subtle gray for inputs */
  input: '#F9FAFB',
  /** Light gray for unselected chips */
  chipInactive: '#F3F4F6',
} as const;

/**
 * Text Colors
 */
export const textColors = {
  /** Dark charcoal for headings, titles */
  primary: '#1F2937',
  /** Gray for subtitles, descriptions */
  secondary: '#6B7280',
  /** Light gray for placeholders, timestamps */
  tertiary: '#9CA3AF',
  /** White text on red buttons */
  onPrimary: '#FFFFFF',
} as const;

/**
 * Semantic Colors - For status indicators
 */
export const semanticColors = {
  /** Green for eligibility, available, success states */
  success: '#10B981',
  /** Orange/amber for urgent (not critical) badges */
  warning: '#F59E0B',
  /** Red for errors (distinct from primary) */
  error: '#EF4444',
  /** Blue for informational badges */
  info: '#3B82F6',
} as const;

/**
 * Illustration Background Colors (Onboarding circles)
 */
export const illustrationColors = {
  /** Very light pink/peach for onboarding circles */
  pinkCircle: '#FEE2E2',
  /** Very light mint green for onboarding circles */
  greenCircle: '#D1FAE5',
} as const;

/**
 * Border Colors
 */
export const borderColors = {
  /** Default border color */
  default: '#E5E7EB',
  /** Focused input border */
  focus: '#E53935',
  /** Selected chip/card border */
  selected: '#E53935',
} as const;

/**
 * Combined color palette for convenience
 */
export const colors = {
  ...primaryColors,
  ...backgroundColors,
  ...textColors,
  ...semanticColors,
  ...illustrationColors,
  ...borderColors,
  // Additional conveniences
  text: textColors,
  bg: backgroundColors,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Font Family - Uses system fonts
 * San Francisco on iOS, Roboto on Android
 */
export const fontFamily = {
  default: 'System',
} as const;

/**
 * Font Weights
 */
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

/**
 * Typography Scale - Heading styles
 */
export const headingStyles = {
  /** Hero text for onboarding: 32px bold */
  hero: {
    fontSize: 32,
    fontWeight: fontWeight.extrabold,
    lineHeight: 38, // 1.2 ratio
  },
  /** Page title: 28px bold */
  pageTitle: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    lineHeight: 35, // 1.25 ratio
  },
  /** Section title: 20px semibold */
  sectionTitle: {
    fontSize: 20,
    fontWeight: fontWeight.semibold,
    lineHeight: 26, // 1.3 ratio
  },
  /** Card title: 16px semibold */
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    lineHeight: 22, // 1.4 ratio
  },
} as const;

/**
 * Typography Scale - Body styles
 */
export const bodyStyles = {
  /** Body text: 16px normal */
  body: {
    fontSize: 16,
    fontWeight: fontWeight.normal,
    lineHeight: 24, // 1.5 ratio
  },
  /** Body small: 14px normal */
  bodySmall: {
    fontSize: 14,
    fontWeight: fontWeight.normal,
    lineHeight: 21, // 1.5 ratio
  },
  /** Caption: 12px normal */
  caption: {
    fontSize: 12,
    fontWeight: fontWeight.normal,
    lineHeight: 17, // 1.4 ratio
  },
  /** Label: 14px medium */
  label: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    lineHeight: 20, // 1.4 ratio
  },
} as const;

/**
 * Typography Scale - Special styles
 */
export const specialStyles = {
  /** Button text: 16px semibold */
  button: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  /** Tab label: 12px medium */
  tabLabel: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    lineHeight: 16,
  },
  /** Badge text: 12px bold uppercase */
  badge: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
} as const;

/**
 * Combined typography object for convenience
 */
export const typography = {
  fontFamily,
  fontWeight,
  ...headingStyles,
  ...bodyStyles,
  ...specialStyles,
} as const;

// =============================================================================
// SPACING
// =============================================================================

/**
 * Spacing Scale (4px base)
 */
export const spacing = (value: number) => {
  return value * 4;
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

/**
 * Border Radius Scale
 */
export const radius = {
  /** 0px */
  none: 0,
  /** 4px - Small badges */
  sm: 4,
  /** 8px - Inputs, small buttons */
  md: 8,
  /** 12px - Cards, large buttons (primary) */
  lg: 12,
  /** 16px - Large cards, selection boxes */
  xl: 16,
  /** 24px - Pills, large buttons */
  '2xl': 24,
  /** 9999px - Circles, avatars, blood badges */
  full: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

/**
 * Shadow Presets for React Native
 * Each includes both iOS (shadow*) and Android (elevation) properties
 */
export const shadows = {
  /** Light shadow for subtle cards */
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Medium shadow for cards, floating elements */
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  /** Large shadow for modals, FABs, emergency button */
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// =============================================================================
// COMPONENT SPECIFICATIONS
// =============================================================================

/**
 * Button Component Specifications
 */
export const buttonSpec = {
  primary: {
    height: 52,
    borderRadius: radius.lg, // 12px
    backgroundColor: primaryColors.primary,
    textColor: textColors.onPrimary,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing(6) // 24px
  },
  secondary: {
    height: 48,
    borderRadius: radius.lg, // 12px
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: 'transparent',
    textColor: textColors.primary,
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing(6), // 24px
  },
} as const;

/**
 * Input Component Specifications
 */
export const inputSpec = {
  height: 52,
  borderWidth: 1,
  borderColor: borderColors.default,
  borderRadius: radius.md, // 8px
  backgroundColor: backgroundColors.background,
  paddingHorizontal: spacing(4), // 16px
  placeholderColor: textColors.tertiary,
  focusBorderColor: borderColors.focus,
  fontSize: 16,
} as const;

/**
 * Blood Type Badge Specifications
 */
export const bloodTypeBadgeSpec = {
  standard: {
    size: 44,
    borderRadius: radius.full,
    backgroundColor: primaryColors.primary,
    fontSize: 16,
    fontWeight: fontWeight.bold,
    textColor: textColors.onPrimary,
  },
  large: {
    size: 50,
    borderRadius: radius.full,
    backgroundColor: primaryColors.primary,
    fontSize: 18,
    fontWeight: fontWeight.bold,
    textColor: textColors.onPrimary,
  },
} as const;

/**
 * Blood Type Selection Chip Specifications
 */
export const bloodTypeChipSpec = {
  width: 75,
  height: 56,
  borderRadius: radius.lg, // 12px
  inactive: {
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: backgroundColors.background,
    textColor: textColors.primary,
  },
  active: {
    borderWidth: 2,
    borderColor: borderColors.selected,
    backgroundColor: primaryColors.primaryLight,
    textColor: primaryColors.primary,
  },
  fontSize: 18,
  fontWeight: fontWeight.semibold,
} as const;

/**
 * Filter Chip Specifications
 */
export const filterChipSpec = {
  height: 36,
  paddingHorizontal: spacing(3), // 12px
  borderRadius: 18, // pill shape
  inactive: {
    backgroundColor: backgroundColors.chipInactive,
    textColor: '#374151',
  },
  active: {
    backgroundColor: primaryColors.primary,
    textColor: textColors.onPrimary,
  },
  fontSize: 14,
  fontWeight: fontWeight.medium,
} as const;

/**
 * Request Card Specifications
 */
export const requestCardSpec = {
  borderRadius: radius.lg, // 12px
  padding: spacing(4), // 16px
  backgroundColor: backgroundColors.card,
  shadow: shadows.medium,
  urgentBorderWidth: 4,
  urgentBorderColor: primaryColors.primary,
} as const;

/**
 * Tab Bar Specifications
 */
export const tabBarSpec = {
  height: 60, // including safe area padding
  backgroundColor: backgroundColors.background,
  borderTopWidth: 1,
  borderTopColor: borderColors.default,
  activeColor: primaryColors.primary,
  inactiveColor: textColors.tertiary,
  iconSize: 24,
  labelFontSize: 12,
  labelFontWeight: fontWeight.medium,
} as const;

/**
 * Pagination Dots Specifications (Onboarding)
 */
export const paginationSpec = {
  inactive: {
    size: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  active: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: primaryColors.primary,
  },
} as const;
