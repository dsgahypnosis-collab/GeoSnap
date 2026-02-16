// Confidence Badge - Shows identification confidence with geological metaphor
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, confidenceColors } from '../utils/theme';

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
}) => {
  const color = confidenceColors(confidence);
  const percentage = Math.round(confidence * 100);

  const getLabel = () => {
    if (confidence >= 0.85) return 'High Certainty';
    if (confidence >= 0.7) return 'Probable';
    if (confidence >= 0.5) return 'Possible';
    return 'Uncertain';
  };

  const sizes = {
    sm: { height: 4, width: 60, fontSize: 10 },
    md: { height: 6, width: 100, fontSize: 12 },
    lg: { height: 8, width: 140, fontSize: 14 },
  };

  const s = sizes[size];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.percentage, { fontSize: s.fontSize + 4, color }]}>
          {percentage}%
        </Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: s.fontSize }]}>
            {getLabel()}
          </Text>
        )}
      </View>
      <View style={[styles.track, { height: s.height, width: s.width }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              height: s.height,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  percentage: {
    fontWeight: '700',
  },
  label: {
    color: colors.textTertiary,
    fontWeight: '500',
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
