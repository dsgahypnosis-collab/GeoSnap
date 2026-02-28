// Crystal Vault - 3D Zero-Gravity Digital Museum
// "Your collection isn't just a list; it's a virtual 3D gallery. 
// Swipe through your discoveries as they float in zero-gravity, glowing with their natural luster."
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../src/utils/theme';
import { adventureColors } from '../../src/utils/adventureTheme';
import { useAppStore } from '../../src/stores/appStore';
import { GlassPanel, SpecimenCard } from '../../src/components';

const { width, height } = Dimensions.get('window');

// Floating specimen card with zero-gravity effect
const FloatingSpecimenCard = ({ 
  specimen, 
  index, 
  onPress,
  viewMode,
}: { 
  specimen: any; 
  index: number;
  onPress: () => void;
  viewMode: 'gallery' | 'grid' | 'list';
}) => {
  const floatY = useSharedValue(0);
  const floatX = useSharedValue(0);
  const glow = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Unique float pattern for each card
    const delay = index * 150;
    const duration = 3000 + (index % 3) * 500;
    
    // Entry animation
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    
    // Float animation
    floatY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(10, { duration, easing: Easing.inOut(Easing.sine) }),
          withTiming(-10, { duration, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        true
      )
    );

    floatX.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(5, { duration: duration * 1.2, easing: Easing.inOut(Easing.sine) }),
          withTiming(-5, { duration: duration * 1.2, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        true
      )
    );

    // Glow pulse
    glow.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: viewMode === 'gallery' ? floatY.value : 0 },
      { translateX: viewMode === 'gallery' ? floatX.value : 0 },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  if (viewMode === 'list') {
    return (
      <SpecimenCard
        specimen={specimen}
        onPress={onPress}
        variant="list"
      />
    );
  }

  if (viewMode === 'grid') {
    return (
      <SpecimenCard
        specimen={specimen}
        onPress={onPress}
        variant="grid"
      />
    );
  }

  // Gallery mode - 3D floating cards
  return (
    <Animated.View style={[styles.floatingCard, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Animated.View style={[styles.cardInner, glowStyle]}>
          {/* Specimen image */}
          <View style={styles.imageContainer}>
            {specimen.image_base64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${specimen.image_base64}` }}
                style={styles.specimenImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[adventureColors.copperRust, adventureColors.brassGold]}
                style={styles.placeholderGradient}
              >
                <Ionicons name="diamond" size={40} color={adventureColors.obsidian} />
              </LinearGradient>
            )}
            
            {/* Holographic overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 212, 255, 0.1)', 'transparent']}
              style={styles.holoOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          {/* Info panel */}
          <View style={styles.infoPanel}>
            <Text style={styles.specimenName} numberOfLines={1}>
              {specimen.identification?.primary_identification?.name || 'Unknown Specimen'}
            </Text>
            <Text style={styles.specimenType} numberOfLines={1}>
              {specimen.identification?.primary_identification?.rock_type || 'Analyzing...'}
            </Text>
            
            {/* Stats row */}
            <View style={styles.statsRow}>
              {specimen.identification?.scientific_data?.mohs_hardness && (
                <View style={styles.statBadge}>
                  <Ionicons name="shield" size={10} color={adventureColors.mineralTeal} />
                  <Text style={styles.statText}>
                    {specimen.identification.scientific_data.mohs_hardness}
                  </Text>
                </View>
              )}
              <View style={styles.statBadge}>
                <Ionicons name="location" size={10} color={adventureColors.amberGlow} />
                <Text style={styles.statText}>Tagged</Text>
              </View>
            </View>
          </View>

          {/* Corner glow accent */}
          <View style={styles.cornerGlow} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Empty vault animation
const EmptyVaultAnimation = () => {
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.emptyIcon, animatedStyle]}>
      <LinearGradient
        colors={['rgba(255, 140, 0, 0.2)', 'rgba(201, 162, 39, 0.1)']}
        style={styles.emptyIconGradient}
      >
        <Ionicons name="cube-outline" size={64} color={adventureColors.brassGold} />
      </LinearGradient>
    </Animated.View>
  );
};

export default function CollectionScreen() {
  const { collection, specimens, fetchCollection, fetchSpecimens } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'grid' | 'list'>('gallery');
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchCollection(), fetchSpecimens()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get unique rock types for filter
  const rockTypes = Array.from(
    new Set(
      specimens
        .map((s) => s.identification?.primary_identification?.rock_type)
        .filter(Boolean)
    )
  );

  const filteredCollection = filter
    ? collection.filter(
        (s) => s.identification?.primary_identification?.rock_type === filter
      )
    : collection;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a0a0c', '#0c0a10', '#08080c', '#0a0a0c']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating background particles */}
      <View style={styles.backgroundParticles}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                opacity: 0.1 + (i % 3) * 0.1,
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(600).delay(100)}
        >
          <View>
            <Text style={styles.title}>THE CRYSTAL VAULT</Text>
            <Text style={styles.subtitle}>
              {collection.length} specimen{collection.length !== 1 ? 's' : ''} in zero-gravity
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'gallery' && styles.viewButtonActive]}
              onPress={() => setViewMode('gallery')}
            >
              <Ionicons
                name="planet"
                size={18}
                color={viewMode === 'gallery' ? adventureColors.amberGlow : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid"
                size={18}
                color={viewMode === 'grid' ? adventureColors.amberGlow : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? adventureColors.amberGlow : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filters */}
        {rockTypes.length > 0 && (
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <TouchableOpacity
              style={[styles.filterChip, !filter && styles.filterChipActive]}
              onPress={() => setFilter(null)}
            >
              <Text style={[styles.filterText, !filter && styles.filterTextActive]}>
                All Specimens
              </Text>
            </TouchableOpacity>
            {rockTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, filter === type && styles.filterChipActive]}
                onPress={() => setFilter(type as string)}
              >
                <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                  {type?.charAt(0).toUpperCase() + type?.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.ScrollView>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            viewMode === 'gallery' && styles.galleryContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={adventureColors.amberGlow}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredCollection.length > 0 ? (
            <View style={viewMode === 'gallery' ? styles.gallery : viewMode === 'grid' ? styles.grid : styles.list}>
              {filteredCollection.map((specimen, index) => (
                <FloatingSpecimenCard
                  key={specimen.id}
                  specimen={specimen}
                  index={index}
                  onPress={() => router.push(`/specimen/${specimen.id}`)}
                  viewMode={viewMode}
                />
              ))}
            </View>
          ) : (
            <Animated.View 
              style={styles.emptyState}
              entering={FadeIn.duration(800).delay(300)}
            >
              <EmptyVaultAnimation />
              <Text style={styles.emptyTitle}>
                {filter ? 'No Matching Specimens' : 'The Vault Awaits'}
              </Text>
              <Text style={styles.emptyText}>
                {filter
                  ? 'Adjust your filter to reveal more discoveries'
                  : 'Your geological treasures will float here in zero-gravity splendor'}
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)')}
              >
                <LinearGradient
                  colors={[adventureColors.amberGlow, adventureColors.brassGold]}
                  style={styles.exploreGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="compass" size={18} color={adventureColors.obsidian} />
                  <Text style={styles.exploreText}>Start Exploring</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  safeArea: {
    flex: 1,
  },
  backgroundParticles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: adventureColors.brassGold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.textPrimary,
    textShadowColor: adventureColors.amberGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  viewButtonActive: {
    backgroundColor: 'rgba(255, 140, 0, 0.15)',
    borderColor: adventureColors.amberGlow,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 140, 0, 0.15)',
    borderColor: adventureColors.amberGlow,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: adventureColors.amberGlow,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  galleryContent: {
    minHeight: height * 0.7,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  // Floating card styles
  floatingCard: {
    width: (width - spacing.md * 3) / 2,
    marginBottom: spacing.md,
  },
  cardInner: {
    backgroundColor: 'rgba(20, 20, 25, 0.9)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
    shadowColor: adventureColors.amberGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  specimenImage: {
    width: '100%',
    height: '100%',
  },
  placeholderGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  infoPanel: {
    padding: spacing.sm,
  },
  specimenName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  specimenType: {
    fontSize: 11,
    color: adventureColors.brassGold,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cornerGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: adventureColors.amberGlow,
    opacity: 0.1,
    borderBottomLeftRadius: 40,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  exploreButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 10,
  },
  exploreText: {
    fontSize: 16,
    fontWeight: '700',
    color: adventureColors.obsidian,
    letterSpacing: 1,
  },
});
