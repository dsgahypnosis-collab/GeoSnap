// GeoSnap Opening Sequence - A thesis statement
// Darkness. A single light source. Matter revealed slowly. Time compressed.
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../src/utils/theme';
import { useAppStore } from '../src/stores/appStore';
import { ObsidianButton } from '../src/components';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
  const { showIntro, setShowIntro, profile } = useAppStore();
  const [phase, setPhase] = useState(0);
  
  // Animated values for cinematic sequence
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.8)).current;
  const lightPulse = useRef(new Animated.Value(0)).current;
  const textReveal = useRef(new Animated.Value(0)).current;
  const buttonReveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cinematic opening sequence
    const sequence = Animated.sequence([
      // Phase 1: Darkness to light
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(lightPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: Logo reveal
      Animated.parallel([
        Animated.spring(scaleIn, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textReveal, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
      // Phase 3: Button appears
      Animated.timing(buttonReveal, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
  }, []);

  const handleEnter = () => {
    setShowIntro(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Deep background gradient - cave darkness */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.obsidian }]} />
      <LinearGradient
        colors={[colors.obsidian, colors.caveShadow, colors.basalt]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient light glow - like headlamp in a cave */}
      <Animated.View
        style={[
          styles.lightGlow,
          {
            opacity: lightPulse,
            transform: [
              {
                scale: lightPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2],
                }),
              },
            ],
          },
        ]}
      />

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [{ scale: scaleIn }],
          },
        ]}
      >
        {/* Crystal icon - the specimen */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.magmaAmber, '#D45A27', colors.specimenGold]}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="diamond" size={48} color={colors.obsidian} />
          </LinearGradient>
        </View>

        {/* Logo text - carved, not printed */}
        <Animated.View style={{ opacity: textReveal }}>
          <Text style={styles.title}>GEOSNAP</Text>
          <Text style={styles.subtitle}>Geological Intelligence</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: textReveal.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7],
              }),
            },
          ]}
        >
          Look Deeper
        </Animated.Text>
      </Animated.View>

      {/* Enter button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonReveal,
            transform: [
              {
                translateY: buttonReveal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ObsidianButton
          title="Begin Discovery"
          onPress={handleEnter}
          size="lg"
          icon={<Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />}
        />

        {profile && (
          <Text style={styles.welcomeBack}>
            Welcome back, {profile.username}
          </Text>
        )}
      </Animated.View>

      {/* Version & Credits */}
      <Animated.View style={[styles.footer, { opacity: buttonReveal }]}>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: colors.magmaAmber,
    opacity: 0.05,
    top: height * 0.2,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.magmaAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  tagline: {
    ...typography.h3,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.xl,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    gap: spacing.md,
  },
  welcomeBack: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
