// Achievement Card - Unlocked treasures from the deep
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassPanel } from './GlassPanel';
import { Achievement } from '../types';
import { colors, typography, borderRadius } from '../utils/theme';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
}) => {
  return (
    <GlassPanel
      style={[styles.card, !achievement.unlocked && styles.locked]}
      variant={achievement.unlocked ? 'elevated' : 'subtle'}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        {achievement.unlocked && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={10} color={colors.obsidian} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            !achievement.unlocked && styles.lockedText,
          ]}
        >
          {achievement.name}
        </Text>
        <Text
          style={[
            styles.description,
            !achievement.unlocked && styles.lockedText,
          ]}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>
        <View style={styles.reward}>
          <Ionicons
            name="star"
            size={12}
            color={achievement.unlocked ? colors.specimenGold : colors.textMuted}
          />
          <Text
            style={[
              styles.rewardText,
              !achievement.unlocked && styles.lockedText,
            ]}
          >
            +{achievement.xp_reward} XP
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 32,
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.emeraldGreen,
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rewardText: {
    color: colors.specimenGold,
    fontSize: 12,
    fontWeight: '600',
  },
  lockedText: {
    color: colors.textMuted,
  },
});
