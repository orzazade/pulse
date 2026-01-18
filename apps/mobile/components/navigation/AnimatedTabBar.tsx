/**
 * AnimatedTabBar Component - Custom tab bar with animated pill indicator
 *
 * Features:
 * - Animated pill background that slides between tabs
 * - Smooth spring animation (300ms)
 * - Proper safe area handling
 * - Works with 5 tabs
 * - Badge support
 *
 * Uses React Native's built-in Animated API for compatibility
 */

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { colors, spacing, tabBarSpec } from '../../theme';

// =============================================================================
// CONSTANTS
// =============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_COUNT = 5;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = TAB_WIDTH - spacing[4]; // 16px margin on each side
const INDICATOR_HEIGHT = 36;

// =============================================================================
// TYPES
// =============================================================================

interface TabItemProps {
  route: BottomTabBarProps['state']['routes'][0];
  index: number;
  isFocused: boolean;
  tabBarLabel: string;
  iconName: string;
  badge?: number | string;
  onPress: () => void;
  onLongPress: () => void;
}

// =============================================================================
// TAB ITEM COMPONENT
// =============================================================================

function TabItem({
  route,
  index,
  isFocused,
  tabBarLabel,
  iconName,
  badge,
  onPress,
  onLongPress,
}: TabItemProps) {
  const color = isFocused
    ? tabBarSpec.activeColor
    : tabBarSpec.inactiveColor;

  return (
    <TouchableOpacity
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={tabBarLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={tabBarSpec.iconSize}
          color={color}
        />
        {badge !== undefined && badge !== 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.label,
          { color },
        ]}
      >
        {tabBarLabel}
      </Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// ANIMATED TAB BAR COMPONENT
// =============================================================================

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;

  // Calculate initial position
  const getIndicatorPosition = (index: number) =>
    index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2;

  // Update indicator position when tab changes
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: getIndicatorPosition(state.index),
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [state.index, translateX]);

  // Get icon name for each route
  const getIconName = (routeName: string, focused: boolean): string => {
    const iconMap: Record<string, { focused: string; unfocused: string }> = {
      index: { focused: 'home', unfocused: 'home-outline' },
      search: { focused: 'search', unfocused: 'search-outline' },
      requests: { focused: 'water', unfocused: 'water-outline' },
      notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
      profile: { focused: 'person', unfocused: 'person-outline' },
    };

    const icons = iconMap[routeName] || { focused: 'help', unfocused: 'help-outline' };
    return focused ? icons.focused : icons.unfocused;
  };

  // Get label for each route
  const getTabLabel = (routeName: string): string => {
    const labelMap: Record<string, string> = {
      index: 'Home',
      search: 'Search',
      requests: 'Requests',
      notifications: 'Alerts',
      profile: 'Profile',
    };
    return labelMap[routeName] || routeName;
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : spacing[2],
        },
      ]}
    >
      {/* Animated pill indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { transform: [{ translateX }] }
        ]}
      />

      {/* Tab items */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabBarLabel = getTabLabel(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              tabBarLabel={tabBarLabel}
              iconName={getIconName(route.name, isFocused)}
              badge={options.tabBarBadge as number | string | undefined}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: tabBarSpec.backgroundColor,
    borderTopWidth: tabBarSpec.borderTopWidth,
    borderTopColor: tabBarSpec.borderTopColor,
    paddingTop: spacing[2],
  },

  tabsContainer: {
    flexDirection: 'row',
    height: 48,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  iconContainer: {
    position: 'relative',
  },

  label: {
    fontSize: tabBarSpec.labelFontSize,
    fontWeight: tabBarSpec.labelFontWeight,
    marginTop: 2,
  },

  indicator: {
    position: 'absolute',
    top: spacing[2],
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    backgroundColor: colors.primaryLight,
    borderRadius: INDICATOR_HEIGHT / 2,
    zIndex: 0,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AnimatedTabBar;
