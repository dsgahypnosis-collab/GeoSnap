// GamificationSystem.tsx - Advanced XP, Achievements, and Progression
// Full gamification with titles, quests, and rewards
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  adventureColors, 
  EXPLORER_TITLES, 
  EXPEDITION_QUESTS, 
  ACHIEVEMENTS,
  RARITY_COLORS,
} from '../../utils/adventureTheme';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

interface GamificationProps {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  achievements: { id: string; unlocked: boolean; unlockedAt?: string }[];
  activeQuests?: { id: string; progress: number; total: number }[];
  onQuestComplete?: (questId: string) => void;
}

// XP gain animation overlay
export const XPGainAnimation = ({ 
  amount, 
  reason, 
  onComplete 
}: { 
  amount: number; 
  reason: string;
  onComplete: () => void;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 300 });
    
    // Float up and fade
    setTimeout(() => {
      translateY.value = withTiming(-50, { duration: 1000 });
      opacity.value = withDelay(500, withTiming(0, { duration: 500 }));
    }, 1500);

    setTimeout(() => {
      runOnJS(onComplete)();
    }, 2500);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.xpGainContainer, animatedStyle]}>
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.95)', 'rgba(255, 165, 0, 0.95)']}
        style={styles.xpGainBubble}
      >
        <Text style={styles.xpGainAmount}>+{amount} XP</Text>
        <Text style={styles.xpGainReason}>{reason}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Level up celebration modal
export const LevelUpCelebration = ({
  visible,
  newLevel,
  onClose,
}: {
  visible: boolean;
  newLevel: number;
  onClose: () => void;
}) => {
  const explorerInfo = EXPLORER_TITLES[newLevel] || EXPLORER_TITLES[1];
  const starPulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      starPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.levelUpOverlay}>
        <Animated.View style={styles.levelUpCard} entering={ZoomIn.duration(500)}>
          {/* Confetti-like decorations */}
          <View style={styles.confettiContainer}>
            {[...Array(12)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    left: `${10 + (i * 7)}%`,
                    backgroundColor: i % 3 === 0 ? adventureColors.amberGlow : 
                                     i % 3 === 1 ? adventureColors.emeraldGreen : 
                                     adventureColors.sapphireBlue,
                    transform: [{ rotate: `${i * 30}deg` }],
                  },
                ]}
                entering={FadeInDown.delay(i * 50).duration(300)}
              />
            ))}
          </View>

          {/* Level badge */}
          <Animated.View style={[styles.levelBadge, starStyle]}>
            <LinearGradient
              colors={[explorerInfo.color, adventureColors.treasureGold]}
              style={styles.levelBadgeGradient}
            >
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={styles.newTitleText}>{explorerInfo.title}</Text>
          <Text style={styles.titleDescription}>{explorerInfo.description}</Text>

          {/* New perks unlocked */}
          <View style={styles.perksContainer}>
            <Text style={styles.perksTitle}>New Perks Unlocked:</Text>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={16} color={adventureColors.emeraldGreen} />
              <Text style={styles.perkText}>+50 Daily XP Bonus</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={16} color={adventureColors.emeraldGreen} />
              <Text style={styles.perkText}>New Crystal Models</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <LinearGradient
              colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Continue Adventure</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Achievement unlocked toast
export const AchievementUnlockedToast = ({
  achievement,
  onDismiss,
}: {
  achievement: typeof ACHIEVEMENTS[0];
  onDismiss: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View 
      style={styles.achievementToast}
      entering={FadeInUp.duration(400)}
    >
      <LinearGradient
        colors={['rgba(30, 30, 35, 0.98)', 'rgba(20, 20, 25, 0.98)']}
        style={styles.achievementToastContent}
      >
        <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '30' }]}>
          <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
        </View>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementLabel}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Quest card component
const QuestCard = ({
  quest,
  progress,
  total,
  onClaim,
}: {
  quest: typeof EXPEDITION_QUESTS[0];
  progress: number;
  total: number;
  onClaim?: () => void;
}) => {
  const isComplete = progress >= total;
  const progressPercent = Math.min((progress / total) * 100, 100);
  const rarity = RARITY_COLORS[quest.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;

  return (
    <Animated.View 
      style={[styles.questCard, isComplete && styles.questCardComplete]}
      entering={FadeInUp.duration(400)}
    >
      <LinearGradient
        colors={isComplete ? [quest.color + '30', 'transparent'] : ['transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.questIcon, { backgroundColor: quest.color + '30' }]}>
        <Ionicons name={quest.icon as any} size={24} color={quest.color} />
      </View>

      <View style={styles.questContent}>
        <View style={styles.questHeader}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: rarity.glow }]}>
            <Text style={[styles.rarityText, { color: rarity.color }]}>{rarity.label}</Text>
          </View>
        </View>
        <Text style={styles.questDescription}>{quest.description}</Text>
        
        {/* Progress bar */}
        <View style={styles.questProgressContainer}>
          <View style={styles.questProgressBar}>
            <View 
              style={[
                styles.questProgressFill, 
                { width: `${progressPercent}%`, backgroundColor: quest.color }
              ]} 
            />
          </View>
          <Text style={styles.questProgressText}>{progress}/{total}</Text>
        </View>

        {/* Reward */}
        <View style={styles.questReward}>
          <Ionicons name="star" size={14} color={adventureColors.xpGold} />
          <Text style={styles.questRewardText}>{quest.xp} XP</Text>
          {isComplete && onClaim && (
            <TouchableOpacity style={styles.claimButton} onPress={onClaim}>
              <Text style={styles.claimText}>Claim</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// Achievement card
const AchievementCard = ({
  achievement,
  unlocked,
}: {
  achievement: typeof ACHIEVEMENTS[0];
  unlocked: boolean;
}) => (
  <Animated.View 
    style={[styles.achievementCard, !unlocked && styles.achievementCardLocked]}
    entering={FadeIn.duration(300)}
  >
    <View style={[
      styles.achievementCardIcon, 
      { backgroundColor: unlocked ? achievement.color + '30' : 'rgba(255,255,255,0.05)' }
    ]}>
      <Ionicons 
        name={unlocked ? achievement.icon as any : 'lock-closed'} 
        size={20} 
        color={unlocked ? achievement.color : colors.textMuted} 
      />
    </View>
    <Text style={[styles.achievementCardTitle, !unlocked && styles.textLocked]}>
      {achievement.title}
    </Text>
    <Text style={[styles.achievementCardDesc, !unlocked && styles.textLocked]} numberOfLines={2}>
      {achievement.description}
    </Text>
    {unlocked && (
      <Text style={styles.achievementCardXP}>+{achievement.xp} XP</Text>
    )}
  </Animated.View>
);

// Main XP Progress component
export const XPProgressDisplay = ({
  currentXP,
  currentLevel,
  xpToNextLevel,
  showDetails = false,
}: {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  showDetails?: boolean;
}) => {
  const explorerInfo = EXPLORER_TITLES[currentLevel] || EXPLORER_TITLES[1];
  const progress = currentXP / (currentXP + xpToNextLevel);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 1000 });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.xpDisplay}>
      <View style={styles.xpHeader}>
        <View style={styles.levelInfo}>
          <View style={[styles.levelCircle, { borderColor: explorerInfo.color }]}>
            <Ionicons name={explorerInfo.icon as any} size={20} color={explorerInfo.color} />
          </View>
          <View>
            <Text style={styles.levelText}>Level {currentLevel}</Text>
            <Text style={[styles.titleText, { color: explorerInfo.color }]}>
              {explorerInfo.title}
            </Text>
          </View>
        </View>
        <View style={styles.xpNumbers}>
          <Text style={styles.currentXP}>{currentXP.toLocaleString()} XP</Text>
          <Text style={styles.xpToNext}>{xpToNextLevel.toLocaleString()} to next</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpBarContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.xpBarBackground}
        />
        <Animated.View style={[styles.xpBarFill, progressStyle]}>
          <LinearGradient
            colors={[explorerInfo.color, adventureColors.treasureGold]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>

      {showDetails && (
        <Text style={styles.xpDetailText}>
          {explorerInfo.description}
        </Text>
      )}
    </View>
  );
};

// Full gamification dashboard
export const GamificationDashboard: React.FC<GamificationProps> = ({
  currentXP,
  currentLevel,
  xpToNextLevel,
  achievements,
  activeQuests = [],
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = ACHIEVEMENTS.filter(
    a => !achievements.find(ua => ua.id === a.id && ua.unlocked)
  );

  return (
    <View style={styles.dashboard}>
      {/* XP Progress */}
      <XPProgressDisplay
        currentXP={currentXP}
        currentLevel={currentLevel}
        xpToNextLevel={xpToNextLevel}
        showDetails
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quests' && styles.tabActive]}
          onPress={() => setActiveTab('quests')}
        >
          <Ionicons 
            name="compass" 
            size={18} 
            color={activeTab === 'quests' ? adventureColors.amberGlow : colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === 'quests' && styles.tabTextActive]}>
            Quests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons 
            name="trophy" 
            size={18} 
            color={activeTab === 'achievements' ? adventureColors.amberGlow : colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
            Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'quests' ? (
          <View style={styles.questsList}>
            {EXPEDITION_QUESTS.slice(0, 5).map((quest) => {
              const questProgress = activeQuests.find(q => q.id === quest.id);
              return (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  progress={questProgress?.progress || 0}
                  total={questProgress?.total || 1}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked || false;
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={isUnlocked}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // XP Gain Animation
  xpGainContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 1000,
  },
  xpGainBubble: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  xpGainAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: adventureColors.obsidian,
  },
  xpGainReason: {
    fontSize: 14,
    color: adventureColors.obsidian,
    opacity: 0.8,
  },
  // Level Up Modal
  levelUpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpCard: {
    width: width * 0.85,
    backgroundColor: adventureColors.glassPanel,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: adventureColors.amberGlow,
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 20,
    borderRadius: 2,
    top: 10,
  },
  levelBadge: {
    marginBottom: spacing.md,
  },
  levelBadgeGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: adventureColors.obsidian,
  },
  levelUpText: {
    fontSize: 28,
    fontWeight: '800',
    color: adventureColors.amberGlow,
    letterSpacing: 4,
  },
  newTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  titleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  perksContainer: {
    marginTop: spacing.lg,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  perksTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  perkText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  continueButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  continueGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: adventureColors.obsidian,
  },
  // Achievement Toast
  achievementToast: {
    position: 'absolute',
    top: 100,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  achievementToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: spacing.md,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: adventureColors.amberGlow,
    letterSpacing: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  achievementXP: {
    fontSize: 12,
    color: adventureColors.xpGold,
    fontWeight: '600',
  },
  // Quest Card
  questCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  questCardComplete: {
    borderColor: adventureColors.emeraldGreen + '50',
  },
  questIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  questDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  questProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  questProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questRewardText: {
    fontSize: 12,
    color: adventureColors.xpGold,
    fontWeight: '600',
  },
  claimButton: {
    marginLeft: 'auto',
    backgroundColor: adventureColors.emeraldGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  claimText: {
    fontSize: 12,
    fontWeight: '700',
    color: adventureColors.obsidian,
  },
  // Achievement Card
  achievementCard: {
    width: (width - spacing.md * 3) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  achievementCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  achievementCardDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  achievementCardXP: {
    fontSize: 11,
    color: adventureColors.xpGold,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  textLocked: {
    color: colors.textMuted,
  },
  // XP Display
  xpDisplay: {
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpNumbers: {
    alignItems: 'flex-end',
  },
  currentXP: {
    fontSize: 18,
    fontWeight: '800',
    color: adventureColors.xpGold,
  },
  xpToNext: {
    fontSize: 11,
    color: colors.textMuted,
  },
  xpBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  xpBarBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Dashboard
  dashboard: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: adventureColors.amberGlow,
  },
  tabContent: {
    flex: 1,
  },
  questsList: {
    gap: spacing.sm,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default GamificationDashboard;
