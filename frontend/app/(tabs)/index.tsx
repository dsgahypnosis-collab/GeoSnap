// Home/Discover Screen - The Gateway to Geological Discovery
// With AI-Personalized Content that constantly updates for each user
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows, borderRadius } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
import { api, PersonalizedContent } from '../../src/utils/api';
import { GlassPanel, ObsidianButton, SpecimenCard, XPProgressBar } from '../../src/components';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    specimens,
    profile,
    leaderboard,
    fetchSpecimens,
    fetchProfile,
    fetchLeaderboard,
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [personalized, setPersonalized] = useState<PersonalizedContent | null>(null);
  const [mineralOfDay, setMineralOfDay] = useState<any>(null);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchSpecimens(),
      fetchProfile(),
      fetchLeaderboard(),
    ]);
    
    // Get personalized content from leaderboard response
    try {
      const lb = await api.getLeaderboard();
      if (lb.personalized) {
        setPersonalized(lb.personalized);
      }
    } catch (e) {
      console.log('Failed to load personalized content:', e);
    }

    // Get mineral of the day
    try {
      const mot = await api.getMineralOfTheDay();
      setMineralOfDay(mot.mineral);
    } catch (e) {
      console.log('Failed to load mineral of day:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentSpecimens = specimens.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.magmaAmber}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {profile?.username || 'Explorer'}
            </Text>
            <Text style={styles.title}>{profile?.title || 'Novice Geologist'}</Text>
          </View>
          <TouchableOpacity
            style={styles.strataButton}
            onPress={() => router.push('/strata')}
          >
            <LinearGradient
              colors={[colors.mineralBlue, colors.basalt]}
              style={styles.strataGradient}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Streak Message - Personalized */}
        {personalized?.streak_message && (
          <GlassPanel style={styles.streakCard} variant="elevated">
            <Ionicons name="flame" size={20} color={colors.magmaAmber} />
            <Text style={styles.streakText}>{personalized.streak_message}</Text>
          </GlassPanel>
        )}

        {/* XP Progress */}
        {leaderboard && (
          <GlassPanel style={styles.xpCard}>
            <XPProgressBar
              currentXP={leaderboard.profile.total_xp}
              level={leaderboard.profile.level}
              progress={leaderboard.level_progress}
              xpToNext={leaderboard.xp_to_next_level}
            />
          </GlassPanel>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/capture')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.magmaAmber, '#D45A27']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="scan" size={32} color={colors.obsidian} />
              <Text style={styles.actionTitle}>Identify</Text>
              <Text style={styles.actionSubtitle}>Analyze specimen</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/notebook')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.mineralBlue, colors.basalt]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="create" size={32} color={colors.textPrimary} />
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Field Note</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Document find</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge - Personalized */}
        {personalized?.next_challenge && (
          <GlassPanel style={styles.challengeCard} variant="elevated">
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIconContainer}>
                <Ionicons name="trophy" size={20} color={colors.specimenGold} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeLabel}>TODAY'S CHALLENGE</Text>
                <Text style={styles.challengeName}>{personalized.next_challenge.name}</Text>
              </View>
              <View style={styles.challengeXP}>
                <Text style={styles.challengeXPText}>+{personalized.next_challenge.xp} XP</Text>
              </View>
            </View>
            <Text style={styles.challengeDescription}>{personalized.next_challenge.description}</Text>
          </GlassPanel>
        )}

        {/* Stats Row */}
        {profile && (
          <View style={styles.statsRow}>
            <GlassPanel style={styles.statCard} variant="subtle">
              <Ionicons name="diamond" size={24} color={colors.crystalTeal} />
              <Text style={styles.statValue}>{profile.specimens_identified}</Text>
              <Text style={styles.statLabel}>Identified</Text>
            </GlassPanel>
            <GlassPanel style={styles.statCard} variant="subtle">
              <Ionicons name="flask" size={24} color={colors.amethystPurple} />
              <Text style={styles.statValue}>{profile.tests_performed}</Text>
              <Text style={styles.statLabel}>Tests</Text>
            </GlassPanel>
            <GlassPanel style={styles.statCard} variant="subtle">
              <Ionicons name="layers" size={24} color={colors.specimenGold} />
              <Text style={styles.statValue}>{profile.collection_size}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </GlassPanel>
          </View>
        )}

        {/* Mineral of the Day */}
        {mineralOfDay && (
          <TouchableOpacity 
            style={styles.mineralDayBanner}
            onPress={() => router.push('/(tabs)/lab')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[mineralOfDay.color || colors.amethystPurple, colors.caveShadow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mineralDayGradient}
            >
              <View style={styles.mineralDayLeft}>
                <Text style={styles.mineralDayLabel}>MINERAL OF THE DAY</Text>
                <Text style={styles.mineralDayName}>{mineralOfDay.name}</Text>
                <Text style={styles.mineralDayFormula}>{mineralOfDay.formula}</Text>
              </View>
              <View style={styles.mineralDayRight}>
                <Ionicons name={(mineralOfDay.icon || 'diamond') as any} size={40} color="rgba(255,255,255,0.6)" />
                <View style={styles.mineralDayHardnessBadge}>
                  <Text style={styles.mineralDayHardnessText}>H: {mineralOfDay.hardness}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Lab & Quiz Quick Access */}
        <View style={styles.labQuickRow}>
          <TouchableOpacity
            style={styles.labQuickCard}
            onPress={() => router.push('/(tabs)/lab')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.amethystPurple, '#6C3FCE']}
              style={styles.labQuickGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="flask" size={24} color="#FFF" />
              <Text style={styles.labQuickTitle}>Geo Lab</Text>
              <Text style={styles.labQuickSub}>5 tools</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.labQuickCard}
            onPress={() => router.push('/(tabs)/lab')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.crystalTeal, '#0090B0']}
              style={styles.labQuickGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="help-circle" size={24} color="#FFF" />
              <Text style={styles.labQuickTitle}>Rock Quiz</Text>
              <Text style={styles.labQuickSub}>Earn XP</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Go Pro Banner - Monetization */}
        <TouchableOpacity 
          style={styles.proBanner}
          onPress={() => router.push('/subscription')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#1a1a2e']}
            style={styles.proBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.proBannerIcon}>
              <Ionicons name="rocket" size={24} color="#FFD700" />
            </View>
            <View style={styles.proBannerContent}>
              <Text style={styles.proBannerTitle}>🚀 Unlock Pro Features</Text>
              <Text style={styles.proBannerText}>Unlimited IDs • Deep Time • Offline Mode</Text>
            </View>
            <View style={styles.proBannerArrow}>
              <Ionicons name="chevron-forward" size={20} color="#FFD700" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Discoveries */}
        {recentSpecimens.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Discoveries</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/collection')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.specimenGrid}>
              {recentSpecimens.map((specimen) => (
                <SpecimenCard
                  key={specimen.id}
                  specimen={specimen}
                  onPress={() => router.push(`/specimen/${specimen.id}`)}
                  variant="grid"
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {specimens.length === 0 && (
          <GlassPanel style={styles.emptyState}>
            <Ionicons name="diamond-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Discoveries Yet</Text>
            <Text style={styles.emptyText}>
              Start your geological journey by capturing your first specimen
            </Text>
            <ObsidianButton
              title="Capture Specimen"
              onPress={() => router.push('/(tabs)/capture')}
              icon={<Ionicons name="camera" size={18} color={colors.textPrimary} />}
            />
          </GlassPanel>
        )}

        {/* Learning Focus - Personalized */}
        {personalized?.learning_focus && (
          <GlassPanel style={styles.learningCard} variant="subtle">
            <View style={styles.learningHeader}>
              <Ionicons name="school" size={20} color={colors.amethystPurple} />
              <Text style={styles.learningLabel}>YOUR LEARNING PATH</Text>
            </View>
            <Text style={styles.learningText}>{personalized.learning_focus}</Text>
          </GlassPanel>
        )}

        {/* Daily Tip - Personalized */}
        {personalized?.daily_tip && (
          <GlassPanel style={styles.tipCard} variant="elevated">
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color={colors.specimenGold} />
              <Text style={styles.tipLabel}>GEOLOGICAL INSIGHT</Text>
            </View>
            <Text style={styles.tipText}>{personalized.daily_tip}</Text>
          </GlassPanel>
        )}

        {/* Geological Fact of the Day - Personalized */}
        {personalized?.geological_fact && (
          <GlassPanel style={styles.factCard} variant="subtle">
            <View style={styles.factHeader}>
              <Ionicons name="earth" size={20} color={colors.crystalTeal} />
              <Text style={styles.factLabel}>DID YOU KNOW?</Text>
            </View>
            <Text style={styles.factText}>{personalized.geological_fact}</Text>
          </GlassPanel>
        )}

        {/* Recommended Tests - Personalized */}
        {personalized?.recommended_tests && personalized.recommended_tests.length > 0 && (
          <GlassPanel style={styles.testsCard}>
            <View style={styles.testsHeader}>
              <Ionicons name="flask" size={20} color={colors.emeraldGreen} />
              <Text style={styles.testsLabel}>RECOMMENDED TESTS</Text>
            </View>
            <View style={styles.testChips}>
              {personalized.recommended_tests.map((test, index) => (
                <View key={index} style={styles.testChip}>
                  <Text style={styles.testChipText}>{test.charAt(0).toUpperCase() + test.slice(1)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.testsHint}>Try these tests on your next specimen</Text>
          </GlassPanel>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  strataButton: {
    ...shadows.md,
  },
  strataGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: colors.magmaAmber,
    borderWidth: 1,
  },
  streakText: {
    ...typography.body,
    color: colors.magmaAmber,
    fontWeight: '600',
    flex: 1,
  },
  xpCard: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionTitle: {
    ...typography.h3,
    color: colors.obsidian,
    marginTop: spacing.sm,
  },
  actionSubtitle: {
    ...typography.caption,
    color: 'rgba(0,0,0,0.6)',
  },
  challengeCard: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  challengeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeLabel: {
    ...typography.caption,
    color: colors.specimenGold,
    letterSpacing: 1,
  },
  challengeName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  challengeXP: {
    backgroundColor: colors.specimenGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  challengeXPText: {
    ...typography.caption,
    color: colors.obsidian,
    fontWeight: '700',
  },
  challengeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  // Pro Banner Styles
  proBanner: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  proBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  proBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  proBannerContent: {
    flex: 1,
  },
  proBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  proBannerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  proBannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.magmaAmber,
    fontWeight: '600',
  },
  specimenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  learningCard: {
    marginBottom: spacing.md,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  learningLabel: {
    ...typography.label,
    color: colors.amethystPurple,
  },
  learningText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tipCard: {
    marginBottom: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipLabel: {
    ...typography.label,
    color: colors.specimenGold,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  factCard: {
    marginBottom: spacing.md,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  factLabel: {
    ...typography.label,
    color: colors.crystalTeal,
  },
  factText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  testsCard: {
    marginBottom: spacing.md,
  },
  testsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  testsLabel: {
    ...typography.label,
    color: colors.emeraldGreen,
  },
  testChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  testChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  testChipText: {
    ...typography.caption,
    color: colors.emeraldGreen,
    fontWeight: '600',
  },
  testsHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  // Mineral of the Day
  mineralDayBanner: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  mineralDayGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 100,
  },
  mineralDayLeft: {
    flex: 1,
  },
  mineralDayLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  mineralDayName: {
    ...typography.h2,
    color: '#FFF',
  },
  mineralDayFormula: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  mineralDayRight: {
    alignItems: 'center',
    gap: 6,
  },
  mineralDayHardnessBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  mineralDayHardnessText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  // Lab Quick Access
  labQuickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  labQuickCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  labQuickGrad: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 85,
    gap: 4,
  },
  labQuickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  labQuickSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
});
