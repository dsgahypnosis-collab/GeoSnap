// Home/Discover Screen - The Gateway to Geological Discovery
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows, borderRadius } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchSpecimens(),
      fetchProfile(),
      fetchLeaderboard(),
    ]);
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

        {/* Geological Tip */}
        <GlassPanel style={styles.tipCard} variant="elevated">
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={colors.specimenGold} />
            <Text style={styles.tipLabel}>Geological Insight</Text>
          </View>
          <Text style={styles.tipText}>
            The Mohs hardness scale ranks minerals from 1 (talc) to 10 (diamond). 
            Your fingernail has a hardness of about 2.5, making it useful for quick field tests.
          </Text>
        </GlassPanel>
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
    marginBottom: spacing.lg,
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
  tipCard: {
    marginTop: spacing.md,
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
});
