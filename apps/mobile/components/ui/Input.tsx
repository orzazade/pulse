/**
 * Input Component - Styled according to PNG specifications
 *
 * Features:
 * - Label support
 * - Error state with message
 * - Focus state with red border
 * - Phone input variant with country code
 * - 52px height, 8px border radius
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  fontWeight,
  inputSpec,
} from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Phone input variant with country code prefix */
  phoneVariant?: boolean;
  /** Country code for phone variant (e.g., '+994') */
  countryCode?: string;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom input style */
  inputStyle?: StyleProp<TextStyle>;
  /** Custom label style */
  labelStyle?: StyleProp<TextStyle>;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Input({
  label,
  error,
  phoneVariant = false,
  countryCode = '+994',
  style,
  inputStyle,
  labelStyle,
  placeholder,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  // Container border style based on state
  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    hasError && styles.error,
    style,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View style={containerStyle}>
        {phoneVariant && (
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <View style={styles.divider} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            phoneVariant && styles.phoneInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2], // 8px
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: inputSpec.height, // 52px
    borderWidth: inputSpec.borderWidth, // 1px
    borderColor: inputSpec.borderColor, // #E5E7EB
    borderRadius: inputSpec.borderRadius, // 8px
    backgroundColor: inputSpec.backgroundColor, // white
    paddingHorizontal: inputSpec.paddingHorizontal, // 16px
  },

  focused: {
    borderColor: inputSpec.focusBorderColor, // #E53935
    borderWidth: 2,
    // Adjust padding to compensate for border width change
    paddingHorizontal: inputSpec.paddingHorizontal - 1,
  },

  error: {
    borderColor: colors.error,
    borderWidth: 2,
    paddingHorizontal: inputSpec.paddingHorizontal - 1,
  },

  input: {
    flex: 1,
    fontSize: inputSpec.fontSize, // 16px
    color: colors.text.primary,
    height: '100%',
    padding: 0, // Reset default padding
  },

  phoneInput: {
    paddingLeft: spacing[2], // 8px
  },

  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCode: {
    fontSize: 16,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.default,
    marginLeft: spacing[3], // 12px
  },

  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing[1], // 4px
  },
});

export default Input;
