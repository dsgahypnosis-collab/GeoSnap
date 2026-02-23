// Subscription/Premium Screen - Explorer's Arsenal Upgrade
// Adventure-Cinematic: Unlock the full power of geological discovery
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../src/utils/theme';
import { adventureColors, adventureTypography } from '../src/utils/adventureTheme';
import { api } from '../src/utils/api';
import { GlassPanel, ObsidianButton } from '../src/components';

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  identifications_per_day: number;
  collection_limit: number;
  has_deep_time: boolean;
  has_offline_mode: boolean;
  has_export: boolean;
  has_priority_ai: boolean;
}

interface SpecialistPack {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export default function SubscriptionScreen() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [packs, setPacks] = useState<SpecialistPack[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [tiersData, statusData] = await Promise.all([
        api.getSubscriptionTiers(),
        api.getSubscriptionStatus(),
      ]);
      
      setTiers(tiersData.tiers);
      setPacks(tiersData.specialist_packs);
      setCurrentTier(statusData.subscription.tier_id);
      setPurchasedPacks(statusData.purchased_packs || []);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    if (tierId === currentTier) return;
    
    setProcessingTier(tierId);
    try {
      // In production, this would open a payment sheet
      // For now, simulate subscription
      const result = await api.subscribe(tierId, selectedBilling === 'yearly');
      Alert.alert('Success!', result.message);
      setCurrentTier(tierId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Subscription failed');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleStartTrial = async () => {
    try {
      const result = await api.startFreeTrial();
      Alert.alert('Trial Started!', `You now have 7 days of Explorer features free!\n\nExpires: ${new Date(result.expires_at).toLocaleDateString()}`);
      setCurrentTier('explorer');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start trial');
    }
  };

  const handlePurchasePack = async (packId: string) => {
    try {
      const result = await api.purchaseSpecialistPack(packId);
      Alert.alert('Success!', result.message);
      setPurchasedPacks([...purchasedPacks, packId]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Purchase failed');
    }
  };

  const getYearlySavings = (tier: SubscriptionTier): number => {
    const monthlyCost = tier.price_monthly * 12;
    const yearlyCost = tier.price_yearly;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.magmaAmber} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade GeoSnap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.magmaAmber, colors.specimenGold]}
            style={styles.heroIcon}
          >
            <Ionicons name="diamond" size={40} color={colors.obsidian} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock Full Geological Power</Text>
          <Text style={styles.heroSubtitle}>
            Unlimited identifications, Deep Time visualization, and more
          </Text>
        </View>

        {/* Free Trial Banner */}
        {currentTier === 'free' && (
          <TouchableOpacity onPress={handleStartTrial}>
            <LinearGradient
              colors={[colors.amethystPurple, colors.mineralBlue]}
              style={styles.trialBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="gift" size={24} color={colors.textPrimary} />
              <View style={styles.trialText}>
                <Text style={styles.trialTitle}>Try Explorer FREE for 7 days</Text>
                <Text style={styles.trialSubtitle}>No credit card required</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Billing Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.billingOption, selectedBilling === 'monthly' && styles.billingOptionActive]}
            onPress={() => setSelectedBilling('monthly')}
          >
            <Text style={[styles.billingText, selectedBilling === 'monthly' && styles.billingTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingOption, selectedBilling === 'yearly' && styles.billingOptionActive]}
            onPress={() => setSelectedBilling('yearly')}
          >
            <Text style={[styles.billingText, selectedBilling === 'yearly' && styles.billingTextActive]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 33%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscription Tiers */}
        <View style={styles.tiersSection}>
          {tiers.filter(t => t.id !== 'free').map((tier) => (
            <GlassPanel
              key={tier.id}
              style={[
                styles.tierCard,
                tier.id === 'geologist_pro' && styles.tierCardPro,
                currentTier === tier.id && styles.tierCardCurrent,
              ]}
              variant={tier.id === 'geologist_pro' ? 'elevated' : 'default'}
            >
              {tier.id === 'geologist_pro' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              
              <Text style={styles.tierName}>{tier.name}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ${selectedBilling === 'yearly' 
                    ? (tier.price_yearly / 12).toFixed(2) 
                    : tier.price_monthly.toFixed(2)}
                </Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              
              {selectedBilling === 'yearly' && (
                <Text style={styles.yearlyPrice}>
                  ${tier.price_yearly}/year (save {getYearlySavings(tier)}%)
                </Text>
              )}

              <View style={styles.featureslist}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.emeraldGreen} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <ObsidianButton
                title={currentTier === tier.id ? 'Current Plan' : 'Subscribe'}
                onPress={() => handleSubscribe(tier.id)}
                disabled={currentTier === tier.id}
                loading={processingTier === tier.id}
                variant={tier.id === 'geologist_pro' ? 'primary' : 'secondary'}
              />
            </GlassPanel>
          ))}
        </View>

        {/* Free Tier Info */}
        <GlassPanel style={styles.freeCard} variant="subtle">
          <View style={styles.freeHeader}>
            <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.freeName}>Free Explorer</Text>
            {currentTier === 'free' && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            )}
          </View>
          <Text style={styles.freeDescription}>
            5 identifications/day • Basic features • 20 specimen collection limit
          </Text>
        </GlassPanel>

        {/* Specialist Packs */}
        <View style={styles.packsSection}>
          <Text style={styles.sectionTitle}>Specialist Packs</Text>
          <Text style={styles.sectionSubtitle}>One-time purchases to expand your expertise</Text>
          
          {packs.map((pack) => (
            <GlassPanel key={pack.id} style={styles.packCard}>
              <View style={styles.packHeader}>
                <View>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDescription}>{pack.description}</Text>
                </View>
                <View style={styles.packPrice}>
                  <Text style={styles.packPriceText}>${pack.price}</Text>
                </View>
              </View>
              
              <View style={styles.packFeatures}>
                {pack.features.map((feature, index) => (
                  <View key={index} style={styles.packFeatureChip}>
                    <Text style={styles.packFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.packButton,
                  purchasedPacks.includes(pack.id) && styles.packButtonPurchased,
                ]}
                onPress={() => handlePurchasePack(pack.id)}
                disabled={purchasedPacks.includes(pack.id)}
              >
                <Text style={styles.packButtonText}>
                  {purchasedPacks.includes(pack.id) ? 'Owned' : 'Purchase'}
                </Text>
              </TouchableOpacity>
            </GlassPanel>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscriptions auto-renew unless cancelled. Manage in Settings.
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  trialText: {
    flex: 1,
  },
  trialTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  trialSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glassPanel,
    borderRadius: borderRadius.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  billingOptionActive: {
    backgroundColor: colors.magmaAmber,
  },
  billingText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  billingTextActive: {
    color: colors.obsidian,
  },
  saveBadge: {
    backgroundColor: colors.emeraldGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  saveBadgeText: {
    ...typography.caption,
    color: colors.obsidian,
    fontWeight: '700',
    fontSize: 10,
  },
  tiersSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tierCard: {
    padding: spacing.lg,
    position: 'relative',
  },
  tierCardPro: {
    borderColor: colors.specimenGold,
    borderWidth: 2,
  },
  tierCardCurrent: {
    borderColor: colors.emeraldGreen,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.specimenGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  popularBadgeText: {
    ...typography.caption,
    color: colors.obsidian,
    fontWeight: '700',
    fontSize: 10,
  },
  tierName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pricePeriod: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  yearlyPrice: {
    ...typography.caption,
    color: colors.emeraldGreen,
    marginBottom: spacing.md,
  },
  featureslist: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  freeCard: {
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  freeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  freeName: {
    ...typography.h3,
    color: colors.textSecondary,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: colors.emeraldGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    ...typography.caption,
    color: colors.obsidian,
    fontWeight: '700',
    fontSize: 10,
  },
  freeDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  packsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  packCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  packName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  packDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: '80%',
  },
  packPrice: {
    backgroundColor: colors.specimenGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  packPriceText: {
    ...typography.body,
    color: colors.obsidian,
    fontWeight: '700',
  },
  packFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  packFeatureChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  packFeatureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  packButton: {
    backgroundColor: colors.mineralBlue,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  packButtonPurchased: {
    backgroundColor: colors.emeraldGreen,
  },
  packButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLink: {
    ...typography.caption,
    color: colors.mineralBlue,
  },
  footerDot: {
    color: colors.textMuted,
  },
});
