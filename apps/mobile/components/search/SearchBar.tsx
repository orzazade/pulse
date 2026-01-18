import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  backgroundColors,
  borderColors,
  textColors,
  spacing,
  radius,
  inputSpec,
} from '@/theme/tokens';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search hospital, city or blood type',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={textColors.tertiary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={textColors.tertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: borderColors.default,
    borderRadius: radius.full,
    backgroundColor: backgroundColors.background,
    paddingHorizontal: spacing(4),
  },
  icon: {
    marginRight: spacing(2),
  },
  input: {
    flex: 1,
    fontSize: inputSpec.fontSize,
    color: textColors.primary,
    height: '100%',
  },
});
