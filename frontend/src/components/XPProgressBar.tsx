// XP Progress Bar - Crystal accretion visualization
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius } from '../utils/theme';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  progress: number; // 0-1
  xpToNext: number;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  level,
  progress,
  xpToNext,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
        <Text style={styles.xpText}>
          {currentXP} XP
        </Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={[colors.amethystPurple, colors.crystalTeal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]}
        />
        {/* Crystal nodes */}
        {[0.25, 0.5, 0.75, 1].map((milestone, i) => (
          <View
            key={i}
            style={[
              styles.milestone,
              { left: `${milestone * 100}%` },
              progress >= milestone && styles.milestoneActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.nextText}>
        {xpToNext > 0 ? `${xpToNext} XP to next level` : 'Max level reached!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: colors.amethystPurple,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  levelText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  milestone: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.obsidian,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: -6,
  },
  milestoneActive: {
    backgroundColor: colors.crystalTeal,
    borderColor: colors.crystalTeal,
  },
  nextText: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
  },
});
