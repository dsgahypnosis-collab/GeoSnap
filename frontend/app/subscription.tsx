// GeoSnap Premium - Monetization Screen
// "Unlock the Full Power of Geological Discovery"
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../src/utils/theme';
import { adventureColors } from '../src/utils/adventureTheme';
import { api } from '../src/utils/api';

const { width, height } = Dimensions.get('window');

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  identifications_per_day: number;
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

// Animated feature check
const FeatureItem = ({ feature, included, delay }: { feature: string; included: boolean; delay: number }) => (
  <Animated.View 
    style={styles.featureItem}
    entering={FadeInUp.delay(delay).duration(300)}
  >
    <View style={[styles.featureIcon, included ? styles.featureIncluded : styles.featureExcluded]}>
      <Ionicons 
        name={included ? "checkmark" : "close"} 
        size={14} 
        color={included ? adventureColors.emeraldGreen : colors.textMuted} 
      />
    </View>
    <Text style={[styles.featureText, !included && styles.featureTextExcluded]}>
      {feature}
    </Text>
  </Animated.View>
);

// Pricing card component
const PricingCard = ({ 
  tier, 
  isPopular, 
  isCurrentPlan,
  selectedBilling,
  onSelect,
  processing,
}: { 
  tier: SubscriptionTier;
  isPopular: boolean;
  isCurrentPlan: boolean;
  selectedBilling: 'monthly' | 'yearly';
  onSelect: () => void;
  processing: boolean;
}) => {
  const price = selectedBilling === 'monthly' ? tier.price_monthly : tier.price_yearly;
  const monthlyEquivalent = selectedBilling === 'yearly' ? (tier.price_yearly / 12).toFixed(2) : tier.price_monthly;
  const savings = selectedBilling === 'yearly' ? Math.round((1 - tier.price_yearly / (tier.price_monthly * 12)) * 100) : 0;

  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    if (isPopular) {
      glowAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.5, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isPopular]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: isPopular ? interpolate(glowAnimation.value, [0, 1], [0.3, 0.7]) : 0.1,
  }));

  const isFree = tier.id === 'free';

  return (
    <Animated.View 
      style={[
        styles.pricingCard,
        isPopular && styles.popularCard,
        glowStyle,
      ]}
      entering={ZoomIn.duration(400)}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <LinearGradient
            colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
            style={styles.popularBadgeGradient}
          >
            <Ionicons name="star" size={12} color={adventureColors.obsidian} />
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </LinearGradient>
        </View>
      )}

      {isCurrentPlan && (
        <View style={styles.currentPlanBadge}>
          <Ionicons name="checkmark-circle" size={14} color={adventureColors.emeraldGreen} />
          <Text style={styles.currentPlanText}>Current Plan</Text>
        </View>
      )}

      {/* Plan name and icon */}
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: isFree ? colors.textMuted + '30' : adventureColors.amberGlow + '30' }]}>
          <Ionicons 
            name={isFree ? "person" : tier.id === 'explorer' ? "compass" : "diamond"} 
            size={28} 
            color={isFree ? colors.textSecondary : adventureColors.amberGlow} 
          />
        </View>
        <Text style={styles.planName}>{tier.name}</Text>
      </View>

      {/* Pricing */}
      <View style={styles.priceContainer}>
        {isFree ? (
          <Text style={styles.freeText}>FREE</Text>
        ) : (
          <>
            <Text style={styles.priceAmount}>${monthlyEquivalent}</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </>
        )}
      </View>

      {!isFree && selectedBilling === 'yearly' && savings > 0 && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>Save {savings}% with yearly</Text>
        </View>
      )}

      {!isFree && (
        <Text style={styles.billedText}>
          {selectedBilling === 'yearly' 
            ? `Billed $${price.toFixed(2)} annually`
            : `Billed monthly`
          }
        </Text>
      )}

      {/* Features */}
      <View style={styles.featuresContainer}>
        <FeatureItem 
          feature={tier.identifications_per_day === -1 ? "Unlimited IDs" : `${tier.identifications_per_day} IDs/day`}
          included={true}
          delay={100}
        />
        <FeatureItem 
          feature="Deep Time Visualization"
          included={tier.has_deep_time}
          delay={150}
        />
        <FeatureItem 
          feature="Offline Mode"
          included={tier.has_offline_mode}
          delay={200}
        />
        <FeatureItem 
          feature="Export Collection"
          included={tier.has_export}
          delay={250}
        />
        <FeatureItem 
          feature="Priority AI Processing"
          included={tier.has_priority_ai}
          delay={300}
        />
        {tier.id === 'geologist_pro' && (
          <FeatureItem 
            feature="All Specialist Packs Included"
            included={true}
            delay={350}
          />
        )}
      </View>

      {/* CTA Button */}
      {!isCurrentPlan && (
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={onSelect}
          disabled={processing || isCurrentPlan}
        >
          <LinearGradient
            colors={isFree 
              ? [colors.textMuted, colors.textMuted]
              : [adventureColors.amberGlow, adventureColors.treasureGold]
            }
            style={styles.ctaGradient}
          >
            {processing ? (
              <ActivityIndicator color={adventureColors.obsidian} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {isFree ? 'Downgrade' : 'Get Started'}
                </Text>
                {!isFree && <Ionicons name="arrow-forward" size={18} color={adventureColors.obsidian} />}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Specialist Pack Card
const PackCard = ({ 
  pack, 
  isPurchased, 
  onPurchase,
  processing,
}: { 
  pack: SpecialistPack;
  isPurchased: boolean;
  onPurchase: () => void;
  processing: boolean;
}) => {
  const getPackIcon = (id: string) => {
    switch (id) {
      case 'gemstone_expert': return 'diamond';
      case 'fossil_hunter': return 'leaf';
      case 'meteorite_finder': return 'planet';
      case 'crystal_mastery': return 'prism';
      default: return 'cube';
    }
  };

  const getPackColor = (id: string) => {
    switch (id) {
      case 'gemstone_expert': return '#E040FB';
      case 'fossil_hunter': return '#8D6E63';
      case 'meteorite_finder': return '#FF5722';
      case 'crystal_mastery': return '#00BCD4';
      default: return adventureColors.amberGlow;
    }
  };

  return (
    <Animated.View 
      style={styles.packCard}
      entering={FadeInUp.duration(400)}
    >
      <View style={[styles.packIcon, { backgroundColor: getPackColor(pack.id) + '30' }]}>
        <Ionicons name={getPackIcon(pack.id) as any} size={24} color={getPackColor(pack.id)} />
      </View>
      
      <View style={styles.packInfo}>
        <Text style={styles.packName}>{pack.name}</Text>
        <Text style={styles.packDescription} numberOfLines={2}>{pack.description}</Text>
      </View>

      <View style={styles.packAction}>
        {isPurchased ? (
          <View style={styles.ownedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={adventureColors.emeraldGreen} />
            <Text style={styles.ownedText}>Owned</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.packBuyButton}
            onPress={onPurchase}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color={adventureColors.obsidian} />
            ) : (
              <Text style={styles.packPrice}>${pack.price.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default function SubscriptionScreen() {
  const params = useLocalSearchParams<{ reason?: string; limit?: string }>();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [packs, setPacks] = useState<SpecialistPack[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [processingPack, setProcessingPack] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [tiersData, statusData] = await Promise.all([
        api.getSubscriptionTiers(),
        api.getSubscriptionStatus(),
      ]);
      
      setTiers(tiersData.tiers || []);
      setPacks(tiersData.specialist_packs || []);
      setCurrentTier(statusData.subscription?.tier_id || 'free');
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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, integrate with App Store / Google Play
      await api.subscribe(tierId, selectedBilling === 'yearly');
      
      Alert.alert(
        '🎉 Welcome to ' + (tierId === 'explorer' ? 'Explorer' : 'Geologist Pro') + '!',
        'Your subscription is now active. Enjoy unlimited geological discovery!',
        [{ text: 'Let\'s Go!', onPress: () => router.back() }]
      );
      
      setCurrentTier(tierId);
    } catch (error) {
      Alert.alert('Oops!', 'Payment failed. Please try again.');
    } finally {
      setProcessingTier(null);
    }
  };

  const handlePurchasePack = async (packId: string) => {
    setProcessingPack(packId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.purchasePack(packId);
      
      const pack = packs.find(p => p.id === packId);
      Alert.alert(
        '🎁 Pack Unlocked!',
        `${pack?.name} has been added to your arsenal!`,
        [{ text: 'Awesome!' }]
      );
      
      setPurchasedPacks([...purchasedPacks, packId]);
    } catch (error) {
      Alert.alert('Oops!', 'Purchase failed. Please try again.');
    } finally {
      setProcessingPack(null);
    }
  };

  const handleStartTrial = async () => {
    setProcessingTier('explorer');
    try {
      await api.startTrial();
      Alert.alert(
        '🚀 Trial Started!',
        'Enjoy 7 days of Explorer features for free!',
        [{ text: 'Explore Now!', onPress: () => router.back() }]
      );
      setCurrentTier('explorer');
    } catch (error: any) {
      Alert.alert('Trial Unavailable', error?.message || 'Free trial already used.');
    } finally {
      setProcessingTier(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={adventureColors.amberGlow} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[adventureColors.obsidian, '#0f0f14', adventureColors.obsidian]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View style={styles.hero} entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={[adventureColors.amberGlow, adventureColors.treasureGold]}
            style={styles.heroIcon}
          >
            <Ionicons name="rocket" size={36} color={adventureColors.obsidian} />
          </LinearGradient>
          
          <Text style={styles.heroTitle}>GO PRO</Text>
          <Text style={styles.heroSubtitle}>
            Unlock unlimited geological discovery
          </Text>

          {/* Show reason if coming from a limit */}
          {params.reason === 'limit' && (
            <View style={styles.limitBanner}>
              <Ionicons name="alert-circle" size={18} color={adventureColors.warning} />
              <Text style={styles.limitText}>
                You've used all {params.limit} free IDs today
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Free Trial Banner */}
        {currentTier === 'free' && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <TouchableOpacity 
              style={styles.trialBanner}
              onPress={handleStartTrial}
              disabled={processingTier !== null}
            >
              <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.trialGradient}
              >
                <View style={styles.trialContent}>
                  <Text style={styles.trialTitle}>🎁 Start 7-Day Free Trial</Text>
                  <Text style={styles.trialSubtitle}>
                    Try Explorer features free • No credit card required
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={adventureColors.amberGlow} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Billing Toggle */}
        <Animated.View style={styles.billingToggle} entering={FadeInUp.delay(300).duration(400)}>
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
        </Animated.View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {tiers.filter(t => t.id !== 'free').map((tier, index) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isPopular={tier.id === 'geologist_pro'}
              isCurrentPlan={tier.id === currentTier}
              selectedBilling={selectedBilling}
              onSelect={() => handleSubscribe(tier.id)}
              processing={processingTier === tier.id}
            />
          ))}
        </View>

        {/* Feature Comparison */}
        <Animated.View style={styles.comparisonSection} entering={FadeInUp.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>Why Go Pro?</Text>
          
          <View style={styles.comparisonGrid}>
            <View style={styles.comparisonItem}>
              <View style={[styles.comparisonIcon, { backgroundColor: '#FF5722' + '30' }]}>
                <Ionicons name="infinite" size={24} color="#FF5722" />
              </View>
              <Text style={styles.comparisonTitle}>Unlimited IDs</Text>
              <Text style={styles.comparisonDesc}>No daily limits</Text>
            </View>
            <View style={styles.comparisonItem}>
              <View style={[styles.comparisonIcon, { backgroundColor: '#9C27B0' + '30' }]}>
                <Ionicons name="time" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.comparisonTitle}>Deep Time</Text>
              <Text style={styles.comparisonDesc}>4.5B year journey</Text>
            </View>
            <View style={styles.comparisonItem}>
              <View style={[styles.comparisonIcon, { backgroundColor: '#00BCD4' + '30' }]}>
                <Ionicons name="cloud-offline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.comparisonTitle}>Offline Mode</Text>
              <Text style={styles.comparisonDesc}>No signal needed</Text>
            </View>
            <View style={styles.comparisonItem}>
              <View style={[styles.comparisonIcon, { backgroundColor: '#4CAF50' + '30' }]}>
                <Ionicons name="download" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.comparisonTitle}>Export Data</Text>
              <Text style={styles.comparisonDesc}>PDF, CSV, JSON</Text>
            </View>
          </View>
        </Animated.View>

        {/* Specialist Packs */}
        <Animated.View style={styles.packsSection} entering={FadeInUp.delay(600).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 Specialist Packs</Text>
            <Text style={styles.sectionSubtitle}>One-time purchase • Keep forever</Text>
          </View>

          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              isPurchased={purchasedPacks.includes(pack.id)}
              onPurchase={() => handlePurchasePack(pack.id)}
              processing={processingPack === pack.id}
            />
          ))}
        </Animated.View>

        {/* Testimonials / Social Proof */}
        <Animated.View style={styles.socialProof} entering={FadeInUp.delay(700).duration(400)}>
          <Text style={styles.socialProofText}>
            ⭐️ Join 10,000+ geologists & rock enthusiasts
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500K+</Text>
              <Text style={styles.statLabel}>Specimens ID'd</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>App Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
          </View>
        </Animated.View>

        {/* Money-back guarantee */}
        <Animated.View style={styles.guarantee} entering={FadeInUp.delay(800).duration(400)}>
          <Ionicons name="shield-checkmark" size={24} color={adventureColors.emeraldGreen} />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
            <Text style={styles.guaranteeSubtitle}>
              Not satisfied? Get a full refund, no questions asked.
            </Text>
          </View>
        </Animated.View>

        {/* Legal */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            Subscriptions auto-renew unless canceled 24 hours before period ends.
            Manage subscriptions in your App Store settings.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Restore Purchases</Text>
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
    backgroundColor: adventureColors.obsidian,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 50,
  },
  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: adventureColors.warning + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  limitText: {
    color: adventureColors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  // Trial Banner
  trialBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: adventureColors.amberGlow + '40',
  },
  trialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  trialContent: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trialSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Billing Toggle
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.full,
    padding: 4,
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
    backgroundColor: adventureColors.amberGlow,
  },
  billingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  billingTextActive: {
    color: adventureColors.obsidian,
  },
  saveBadge: {
    backgroundColor: adventureColors.emeraldGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: adventureColors.obsidian,
  },
  // Pricing Cards
  pricingContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  pricingCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  popularCard: {
    borderColor: adventureColors.amberGlow,
    shadowColor: adventureColors.amberGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  popularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: adventureColors.obsidian,
    letterSpacing: 1,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentPlanText: {
    fontSize: 11,
    color: adventureColors.emeraldGreen,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  planIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  freeText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: adventureColors.emeraldGreen + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  savingsText: {
    fontSize: 12,
    color: adventureColors.emeraldGreen,
    fontWeight: '600',
  },
  billedText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  featuresContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIncluded: {
    backgroundColor: adventureColors.emeraldGreen + '30',
  },
  featureExcluded: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  featureText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  featureTextExcluded: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: adventureColors.obsidian,
  },
  // Comparison
  comparisonSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  comparisonItem: {
    width: (width - spacing.md * 3) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  comparisonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  comparisonDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Packs
  packsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  packIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  packName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  packDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  packAction: {
    marginLeft: spacing.sm,
  },
  packBuyButton: {
    backgroundColor: adventureColors.amberGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  packPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: adventureColors.obsidian,
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownedText: {
    fontSize: 12,
    color: adventureColors.emeraldGreen,
    fontWeight: '600',
  },
  // Social Proof
  socialProof: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  socialProofText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: adventureColors.amberGlow,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  // Guarantee
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: adventureColors.emeraldGreen + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guaranteeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Legal
  legal: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  legalLink: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
