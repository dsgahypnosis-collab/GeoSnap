// Profile Screen - Explorer's Path & Gamification
// Adventure-Cinematic Design: Explorer's journey through geological mastery
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/utils/theme';
import { adventureColors, adventureTypography, EXPLORER_TITLES } from '../../src/utils/adventureTheme';
import { useAppStore } from '../../src/stores/appStore';
import { api } from '../../src/utils/api';
import { GlassPanel, XPProgressBar, AchievementCard, ObsidianButton } from '../../src/components';

interface SubscriptionStatus {
  subscription: {
    tier_id: string;
    status: string;
    expires_at: string | null;
  };
  tier: {
    name: string;
    identifications_per_day: number;
  };
  usage: {
    identifications_today: number;
    remaining_identifications: number;
    is_unlimited: boolean;
  };
  features: {
    has_deep_time: boolean;
    has_offline: boolean;
    has_export: boolean;
  };
}

export default function ProfileScreen() {
  const { profile, leaderboard, fetchProfile, fetchLeaderboard } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchProfile(), fetchLeaderboard()]);
    // Load subscription status
    try {
      const status = await api.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.log('Failed to load subscription status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    try {
      await api.updateUsername(newUsername.trim());
      await fetchProfile();
      setEditingName(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const unlockedAchievements = profile?.achievements.filter((a) => a.unlocked) || [];
  const lockedAchievements = profile?.achievements.filter((a) => !a.unlocked) || [];

  // Get Explorer title based on level
  const getExplorerTitle = (level: number) => {
    return EXPLORER_TITLES[level] || EXPLORER_TITLES[1];
  };

  const currentExplorerInfo = profile ? getExplorerTitle(profile.level) : getExplorerTitle(1);
  const isPremium = subscriptionStatus?.subscription?.tier_id !== 'free';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={adventureColors.amberGlow}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Explorer Profile Header */}
        <GlassPanel style={styles.profileCard} variant="elevated">
          <LinearGradient
            colors={[adventureColors.brassGold, adventureColors.copperRust]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={currentExplorerInfo.icon as any} size={40} color={adventureColors.obsidian} />
          </LinearGradient>

          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter username"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingName(false)}
                >
                  <Ionicons name="close" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveEditButton]}
                  onPress={handleUpdateUsername}
                >
                  <Ionicons name="checkmark" size={20} color={colors.obsidian} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameContainer}
              onPress={() => {
                setNewUsername(profile?.username || '');
                setEditingName(true);
              }}
            >
              <Text style={styles.username}>{profile?.username || 'Explorer'}</Text>
              <Ionicons name="pencil" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* Explorer Title with Adventure styling */}
          <View style={styles.explorerTitleContainer}>
            <Text style={styles.explorerTitle}>{currentExplorerInfo.title}</Text>
            <Text style={styles.explorerSubtitle}>{currentExplorerInfo.description}</Text>
          </View>

          {leaderboard && (
            <View style={styles.xpContainer}>
              <XPProgressBar
                currentXP={leaderboard.profile.total_xp}
                level={leaderboard.profile.level}
                progress={leaderboard.level_progress}
                xpToNext={leaderboard.xp_to_next_level}
              />
            </View>
          )}
        </GlassPanel>

        {/* Subscription Status Card */}
        <GlassPanel style={styles.subscriptionCard} variant="elevated">
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionInfo}>
              <View style={[
                styles.tierBadge,
                isPremium && styles.tierBadgePremium
              ]}>
                <Ionicons 
                  name={isPremium ? "diamond" : "person"} 
                  size={16} 
                  color={isPremium ? adventureColors.obsidian : adventureColors.textSecondary} 
                />
                <Text style={[
                  styles.tierBadgeText,
                  isPremium && styles.tierBadgeTextPremium
                ]}>
                  {subscriptionStatus?.tier?.name || 'Free Explorer'}
                </Text>
              </View>
              {subscriptionStatus?.usage && !subscriptionStatus.usage.is_unlimited && (
                <Text style={styles.usageText}>
                  {subscriptionStatus.usage.remaining_identifications} IDs remaining today
                </Text>
              )}
              {subscriptionStatus?.usage?.is_unlimited && (
                <Text style={styles.usageTextUnlimited}>Unlimited identifications</Text>
              )}
            </View>
            
            {!isPremium && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/subscription')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[adventureColors.amberGlow, adventureColors.brassGold]}
                  style={styles.upgradeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="rocket" size={16} color={adventureColors.obsidian} />
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
          
          {!isPremium && (
            <View style={styles.upgradeFeatures}>
              <Text style={styles.upgradeFeaturesTitle}>Unlock with Pro:</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="infinite" size={14} color={adventureColors.mineralTeal} />
                  <Text style={styles.featureText}>Unlimited IDs</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={14} color={adventureColors.cosmicPurple} />
                  <Text style={styles.featureText}>Deep Time</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="download" size={14} color={adventureColors.brassGold} />
                  <Text style={styles.featureText}>Export</Text>
                </View>
              </View>
            </View>
          )}
        </GlassPanel>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <GlassPanel style={styles.statCard} variant="subtle">
            <Ionicons name="diamond" size={28} color={colors.crystalTeal} />
            <Text style={styles.statValue}>{profile?.specimens_identified || 0}</Text>
            <Text style={styles.statLabel}>Identified</Text>
          </GlassPanel>
          <GlassPanel style={styles.statCard} variant="subtle">
            <Ionicons name="flask" size={28} color={colors.amethystPurple} />
            <Text style={styles.statValue}>{profile?.tests_performed || 0}</Text>
            <Text style={styles.statLabel}>Tests Run</Text>
          </GlassPanel>
          <GlassPanel style={styles.statCard} variant="subtle">
            <Ionicons name="layers" size={28} color={colors.specimenGold} />
            <Text style={styles.statValue}>{profile?.collection_size || 0}</Text>
            <Text style={styles.statLabel}>Collected</Text>
          </GlassPanel>
          <GlassPanel style={styles.statCard} variant="subtle">
            <Ionicons name="book" size={28} color={colors.magmaAmber} />
            <Text style={styles.statValue}>{profile?.field_notes_count || 0}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </GlassPanel>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {unlockedAchievements.length}/{profile?.achievements.length || 0}
            </Text>
          </View>

          {unlockedAchievements.length > 0 && (
            <View style={styles.achievementSection}>
              <Text style={styles.achievementSubtitle}>Unlocked</Text>
              <View style={styles.achievementList}>
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </View>
          )}

          {lockedAchievements.length > 0 && (
            <View style={styles.achievementSection}>
              <Text style={styles.achievementSubtitle}>Locked</Text>
              <View style={styles.achievementList}>
                {lockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Active Expedition Quests */}
        {leaderboard?.personalized && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expedition</Text>
              <Ionicons name="compass" size={20} color={colors.magmaAmber} />
            </View>

            {/* Daily Challenge */}
            {leaderboard.personalized.next_challenge && (
              <GlassPanel style={styles.questCard} variant="elevated">
                <LinearGradient
                  colors={['rgba(255,107,53,0.15)', 'rgba(139,92,246,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.questGradient}
                >
                  <View style={styles.questHeader}>
                    <View style={styles.questIconBg}>
                      <Ionicons name="flag" size={18} color={colors.magmaAmber} />
                    </View>
                    <View style={styles.questInfo}>
                      <Text style={styles.questTitle}>{leaderboard.personalized.next_challenge.name}</Text>
                      <Text style={styles.questDesc}>{leaderboard.personalized.next_challenge.description}</Text>
                    </View>
                    <View style={styles.questXP}>
                      <Ionicons name="star" size={14} color={colors.specimenGold} />
                      <Text style={styles.questXPText}>+{leaderboard.personalized.next_challenge.xp}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </GlassPanel>
            )}

            {/* Daily Tip */}
            <GlassPanel style={styles.tipCard} variant="subtle">
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={18} color={colors.specimenGold} />
                <Text style={styles.tipTitle}>Daily Insight</Text>
              </View>
              <Text style={styles.tipText}>{leaderboard.personalized.daily_tip}</Text>
            </GlassPanel>

            {/* Streak */}
            <GlassPanel style={styles.streakCard} variant="subtle">
              <Ionicons name="flame" size={24} color={colors.magmaAmber} />
              <Text style={styles.streakMessage}>{leaderboard.personalized.streak_message}</Text>
            </GlassPanel>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.md }]}>Quick Access</Text>
          <View style={styles.quickLinks}>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/lab')}>
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
                <Ionicons name="flask" size={22} color={colors.magmaAmber} />
              </View>
              <Text style={styles.quickLinkText}>Lab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/notebook')}>
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(0,180,216,0.15)' }]}>
                <Ionicons name="book" size={22} color={colors.crystalTeal} />
              </View>
              <Text style={styles.quickLinkText}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/subscription')}>
              <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                <Ionicons name="diamond" size={22} color={colors.amethystPurple} />
              </View>
              <Text style={styles.quickLinkText}>Plans</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About GeoSnap */}
        <GlassPanel style={styles.aboutCard} variant="subtle">
          <View style={styles.aboutHeader}>
            <Ionicons name="information-circle" size={20} color={colors.mineralBlue} />
            <Text style={styles.aboutTitle}>About GeoSnap</Text>
          </View>
          <Text style={styles.aboutText}>
            GeoSnap is a cinematic geological intelligence platform that combines
            AI-driven identification with real-world geological reasoning.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </GlassPanel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: adventureColors.brassGold,
    ...shadows.lg,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  explorerTitleContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  explorerTitle: {
    ...adventureTypography.subtitle,
    color: adventureColors.brassGold,
    marginTop: spacing.xs,
  },
  explorerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  editNameContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  nameInput: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: adventureColors.amberGlow,
    paddingBottom: spacing.xs,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveEditButton: {
    backgroundColor: adventureColors.success,
  },
  xpContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  // Subscription card styles
  subscriptionCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  tierBadgePremium: {
    backgroundColor: adventureColors.brassGold,
  },
  tierBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tierBadgeTextPremium: {
    color: adventureColors.obsidian,
  },
  usageText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  usageTextUnlimited: {
    ...typography.caption,
    color: adventureColors.mineralTeal,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  upgradeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  upgradeButtonText: {
    ...typography.body,
    color: adventureColors.obsidian,
    fontWeight: '700',
  },
  upgradeFeatures: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  upgradeFeaturesTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  featuresList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  achievementCount: {
    ...typography.body,
    color: adventureColors.amberGlow,
    fontWeight: '600',
  },
  achievementSection: {
    marginBottom: spacing.md,
  },
  achievementSubtitle: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  achievementList: {
    gap: spacing.sm,
  },
  aboutCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aboutTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  aboutText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  // Quest cards
  questCard: {
    marginBottom: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  questGradient: {
    padding: spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  questIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  questDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  questXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  questXPText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.specimenGold,
  },
  // Tip card
  tipCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.bodySmall,
    color: colors.specimenGold,
    fontWeight: '600',
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Streak card
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  streakMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  // Quick links
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
