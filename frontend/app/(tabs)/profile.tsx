// Profile Screen - Gamification & Progression
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/utils/theme';
import { useAppStore } from '../../src/stores/appStore';
import { api } from '../../src/utils/api';
import { GlassPanel, XPProgressBar, AchievementCard, ObsidianButton } from '../../src/components';

export default function ProfileScreen() {
  const { profile, leaderboard, fetchProfile, fetchLeaderboard } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchProfile(), fetchLeaderboard()]);
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
        {/* Profile Header */}
        <GlassPanel style={styles.profileCard} variant="elevated">
          <LinearGradient
            colors={[colors.amethystPurple, colors.mineralBlue]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={40} color={colors.textPrimary} />
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

          <Text style={styles.title}>{profile?.title || 'Novice Geologist'}</Text>

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
    marginBottom: spacing.lg,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  title: {
    ...typography.bodySmall,
    color: colors.specimenGold,
    marginTop: spacing.xs,
    fontWeight: '600',
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
    borderBottomColor: colors.magmaAmber,
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
    backgroundColor: colors.emeraldGreen,
  },
  xpContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
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
    color: colors.magmaAmber,
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
});
