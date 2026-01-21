import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  backgroundColors,
  borderColors,
  textColors,
  spacing,
  radius,
  inputSpec,
  iconSpec,
  touchTargetSpec,
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
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={iconSpec.sm}
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
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={iconSpec.sm}
            color={textColors.tertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: inputSpec.height,
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
  clearButton: {
    width: touchTargetSpec.minimum,
    height: touchTargetSpec.minimum,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing(1),
  },
});
