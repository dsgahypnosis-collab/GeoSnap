// Rock Type Badge - Classification indicator with geological color coding
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, rockTypeColors } from '../utils/theme';

interface RockTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export const RockTypeBadge: React.FC<RockTypeBadgeProps> = ({
  type,
  size = 'md',
}) => {
  const color = rockTypeColors[type.toLowerCase()] || colors.mineralBlue;
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}20`,
          borderColor: `${color}40`,
        },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.text,
          { color },
          size === 'sm' && styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
});
