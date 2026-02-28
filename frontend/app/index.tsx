// GeoSnap Opening Sequence - "The Earth Awakens"
// A cinematic journey from Earth's core to the surface
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../src/utils/theme';
import { adventureColors } from '../src/utils/adventureTheme';
import { useAppStore } from '../src/stores/appStore';

const { width, height } = Dimensions.get('window');

// Crystal shard component for logo assembly
const CrystalShard = ({ 
  delay, 
  startX, 
  startY, 
  rotation,
  size = 20,
  color = adventureColors.amberGlow,
}: {
  delay: number;
  startX: number;
  startY: number;
  rotation: number;
  size?: number;
  color?: string;
}) => {
  const progress = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 80 }));
    glow.value = withDelay(delay + 300, withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [startX, 0]) },
      { translateY: interpolate(progress.value, [0, 1], [startY, 0]) },
      { rotate: `${interpolate(progress.value, [0, 1], [rotation, 0])}deg` },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0, 1.2, 1]) },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0.3, 0.8]),
  }));

  return (
    <Animated.View style={[styles.crystalShard, animatedStyle, glowStyle, { 
      width: size, 
      height: size * 1.5,
      backgroundColor: color,
      shadowColor: color,
    }]} />
  );
};

// Molten core particle
const MagmaParticle = ({ delay, index }: { delay: number; index: number }) => {
  const progress = useSharedValue(0);
  const angle = (index / 12) * Math.PI * 2;
  const radius = 60 + Math.random() * 40;

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle + progress.value * Math.PI) * radius * (0.8 + progress.value * 0.4) },
      { translateY: Math.sin(angle + progress.value * Math.PI) * radius * (0.8 + progress.value * 0.4) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 1, 0.5]) },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]),
  }));

  return (
    <Animated.View style={[styles.magmaParticle, animatedStyle, {
      backgroundColor: index % 2 === 0 ? '#FF4500' : '#FF8C00',
    }]} />
  );
};

export default function IntroScreen() {
  const { profile, fetchProfile } = useAppStore();
  const [phase, setPhase] = useState<'core' | 'rise' | 'surface' | 'logo' | 'ready'>('core');
  
  // Animation values
  const coreScale = useSharedValue(1);
  const coreOpacity = useSharedValue(1);
  const riseProgress = useSharedValue(0);
  const surfaceFlash = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const pulseGlow = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
    startCinematicSequence();
  }, []);

  const startCinematicSequence = () => {
    // Phase 1: Core pulsing (0-2s)
    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      3,
      true
    );

    // Phase 2: Rise through layers (2-4s)
    setTimeout(() => {
      setPhase('rise');
      riseProgress.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) });
      coreOpacity.value = withTiming(0, { duration: 1500 });
    }, 2000);

    // Phase 3: Surface flash (4-4.5s)
    setTimeout(() => {
      setPhase('surface');
      surfaceFlash.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
    }, 4000);

    // Phase 4: Logo assembly (4.5-6s)
    setTimeout(() => {
      setPhase('logo');
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      // Continuous glow pulse
      pulseGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.5, { duration: 2000 })
        ),
        -1,
        true
      );
    }, 4500);

    // Phase 5: Title reveal (6-7s)
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 800 });
    }, 6000);

    // Phase 6: Subtitle (7-7.5s)
    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 600 });
    }, 7000);

    // Phase 7: Button reveal (7.5-8s)
    setTimeout(() => {
      setPhase('ready');
      buttonOpacity.value = withTiming(1, { duration: 600 });
      buttonTranslateY.value = withSpring(0, { damping: 12 });
    }, 7500);
  };

  const handleEnter = () => {
    router.replace('/(tabs)');
  };

  // Animated styles
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
    opacity: coreOpacity.value,
  }));

  const riseLayerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(riseProgress.value, [0, 1], [0, -height * 0.3]) },
      { scale: interpolate(riseProgress.value, [0, 1], [1, 0.3]) },
    ],
    opacity: interpolate(riseProgress.value, [0, 0.8, 1], [1, 0.5, 0]),
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: surfaceFlash.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(pulseGlow.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulseGlow.value, [0, 1], [1, 1.05]) }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: interpolate(titleOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient - deep earth */}
      <LinearGradient
        colors={['#0a0a0c', '#1a0a0a', '#0a0a0c']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Phase 1 & 2: Molten Core */}
      {(phase === 'core' || phase === 'rise') && (
        <Animated.View style={[styles.coreContainer, coreStyle, riseLayerStyle]}>
          {/* Core glow */}
          <View style={styles.coreGlow}>
            <LinearGradient
              colors={['#FF4500', '#FF8C00', '#FFD700']}
              style={styles.coreGradient}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          
          {/* Magma particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <MagmaParticle key={i} delay={i * 100} index={i} />
          ))}
          
          {/* Core center */}
          <View style={styles.coreCenter}>
            <Text style={styles.coreText}>CORE</Text>
          </View>
        </Animated.View>
      )}

      {/* Phase 3: Surface flash */}
      <Animated.View style={[styles.surfaceFlash, flashStyle]}>
        <LinearGradient
          colors={['transparent', '#FFD700', '#FFFFFF', '#FFD700', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      {/* Phase 4+: Logo assembly */}
      {(phase === 'logo' || phase === 'ready') && (
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          {/* Crystal shards assembling */}
          <View style={styles.crystalAssembly}>
            <CrystalShard delay={0} startX={-100} startY={-80} rotation={-45} size={18} color="#FF8C00" />
            <CrystalShard delay={100} startX={100} startY={-60} rotation={45} size={22} color="#FFD700" />
            <CrystalShard delay={200} startX={-80} startY={80} rotation={-30} size={16} color="#FF4500" />
            <CrystalShard delay={300} startX={80} startY={60} rotation={30} size={20} color="#FFA500" />
            <CrystalShard delay={400} startX={0} startY={-100} rotation={0} size={24} color="#FF8C00" />
            <CrystalShard delay={500} startX={-120} startY={0} rotation={-60} size={14} color="#FFD700" />
            <CrystalShard delay={600} startX={120} startY={0} rotation={60} size={14} color="#FF4500" />
          </View>

          {/* Main crystal icon */}
          <Animated.View style={[styles.mainCrystal, glowStyle]}>
            <LinearGradient
              colors={[adventureColors.amberGlow, adventureColors.brassGold, '#FFD700']}
              style={styles.crystalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="diamond" size={52} color={adventureColors.obsidian} />
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      )}

      {/* Title */}
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>G E O S N A P</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        GEOLOGICAL INTELLIGENCE
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, subtitleStyle]}>
        The Earth Awakens
      </Animated.Text>

      {/* Enter button */}
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <TouchableOpacity 
          style={styles.enterButton} 
          onPress={handleEnter}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[adventureColors.amberGlow, adventureColors.brassGold]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="compass" size={22} color={adventureColors.obsidian} />
            <Text style={styles.buttonText}>Begin Expedition</Text>
            <Ionicons name="arrow-forward" size={20} color={adventureColors.obsidian} />
          </LinearGradient>
        </TouchableOpacity>

        {profile && (
          <Text style={styles.welcomeBack}>
            Welcome back, {profile.username}
          </Text>
        )}
      </Animated.View>

      {/* Version */}
      <Animated.View style={[styles.footer, buttonStyle]}>
        <Text style={styles.version}>v1.0.0 • Cinematic Edition</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0c',
  },
  // Core styles
  coreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  coreGradient: {
    flex: 1,
    borderRadius: 75,
  },
  coreCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  coreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF4500',
    letterSpacing: 2,
  },
  magmaParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  // Surface flash
  surfaceFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  // Logo styles
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  crystalAssembly: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalShard: {
    position: 'absolute',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 5,
  },
  mainCrystal: {
    shadowColor: adventureColors.amberGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 15,
  },
  crystalGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: adventureColors.brassGold,
  },
  // Title styles
  titleContainer: {
    marginTop: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 6,
    textShadowColor: adventureColors.amberGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 6,
    marginTop: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: adventureColors.amberGlow,
    marginTop: 24,
    opacity: 0.8,
  },
  // Button styles
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    gap: 16,
  },
  enterButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: adventureColors.amberGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: adventureColors.obsidian,
    letterSpacing: 1,
  },
  welcomeBack: {
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
