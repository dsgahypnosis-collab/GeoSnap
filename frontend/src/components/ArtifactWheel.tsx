// The Artifact Wheel - Compass-like navigation hub
// "A circular, compass-like hub with glowing Earth core"
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adventureColors, adventureTypography } from '../utils/adventureTheme';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const CENTER_SIZE = 80;

interface WheelItem {
  id: string;
  icon: string;
  label: string;
  color: string;
}

const WHEEL_ITEMS: WheelItem[] = [
  { id: 'scan', icon: 'scan', label: 'Discover', color: adventureColors.amberGlow },
  { id: 'collection', icon: 'layers', label: 'Vault', color: adventureColors.mineralTeal },
  { id: 'time', icon: 'time', label: 'Deep Time', color: adventureColors.cosmicPurple },
  { id: 'challenges', icon: 'trophy', label: 'Quests', color: adventureColors.brassGold },
  { id: 'strata', icon: 'chatbubble-ellipses', label: 'Strata', color: adventureColors.starLight },
  { id: 'profile', icon: 'compass', label: 'Explorer', color: adventureColors.copperRust },
];

interface ArtifactWheelProps {
  onSelect: (id: string) => void;
  selectedId?: string;
}

export const ArtifactWheel: React.FC<ArtifactWheelProps> = ({ onSelect, selectedId }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const [currentRotation, setCurrentRotation] = useState(0);
  const coreGlow = useRef(new Animated.Value(0.5)).current;

  // Core glow animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coreGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(coreGlow, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const angle = Math.atan2(gestureState.dy, gestureState.dx) * (180 / Math.PI);
        rotation.setValue(currentRotation + angle);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = Math.sqrt(
          gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy
        );
        
        // Add inertia
        Animated.decay(rotation, {
          velocity: velocity * 0.5,
          deceleration: 0.997,
          useNativeDriver: true,
        }).start();
        
        setCurrentRotation(currentRotation + velocity * 10);
      },
    })
  ).current;

  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer ring decorations */}
      <View style={styles.outerRing}>
        {[...Array(36)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.tickMark,
              {
                transform: [
                  { rotate: `${i * 10}deg` },
                  { translateY: -WHEEL_SIZE / 2 + 5 },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Main wheel */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.wheel, { transform: [{ rotate: spin }] }]}
      >
        {WHEEL_ITEMS.map((item, index) => {
          const angle = (index * 360) / WHEEL_ITEMS.length - 90;
          const radians = (angle * Math.PI) / 180;
          const radius = WHEEL_SIZE / 2 - 50;
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.wheelItem,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
                selectedId === item.id && styles.wheelItemSelected,
              ]}
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconContainer, { shadowColor: item.color }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.itemLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Center core - glowing Earth */}
      <Animated.View style={[styles.centerCore, { opacity: coreGlow }]}>
        <View style={styles.coreInner}>
          <View style={styles.coreGlow} />
          <Ionicons name="earth" size={36} color={adventureColors.amberGlow} />
        </View>
      </Animated.View>

      {/* Compass directions */}
      <View style={styles.compassDirections}>
        <Text style={[styles.compassText, styles.compassN]}>N</Text>
        <Text style={[styles.compassText, styles.compassE]}>E</Text>
        <Text style={[styles.compassText, styles.compassS]}>S</Text>
        <Text style={[styles.compassText, styles.compassW]}>W</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: adventureColors.brassGold,
    opacity: 0.3,
  },
  wheel: {
    width: WHEEL_SIZE - 20,
    height: WHEEL_SIZE - 20,
    borderRadius: (WHEEL_SIZE - 20) / 2,
    borderWidth: 2,
    borderColor: adventureColors.glassBorder,
    backgroundColor: adventureColors.glassPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItem: {
    position: 'absolute',
    alignItems: 'center',
    padding: 8,
  },
  wheelItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: adventureColors.leatherPanel,
    borderWidth: 2,
    borderColor: adventureColors.brassGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  itemLabel: {
    ...adventureTypography.label,
    marginTop: 4,
    fontSize: 9,
  },
  centerCore: {
    position: 'absolute',
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreInner: {
    width: CENTER_SIZE - 10,
    height: CENTER_SIZE - 10,
    borderRadius: (CENTER_SIZE - 10) / 2,
    backgroundColor: adventureColors.obsidian,
    borderWidth: 3,
    borderColor: adventureColors.brassGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreGlow: {
    position: 'absolute',
    width: CENTER_SIZE + 20,
    height: CENTER_SIZE + 20,
    borderRadius: (CENTER_SIZE + 20) / 2,
    backgroundColor: adventureColors.volcanicOrange,
    opacity: 0.2,
  },
  compassDirections: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
  },
  compassText: {
    position: 'absolute',
    color: adventureColors.brassGold,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
  },
  compassN: {
    top: 5,
    alignSelf: 'center',
    left: WHEEL_SIZE / 2 - 5,
  },
  compassE: {
    right: 5,
    top: WHEEL_SIZE / 2 - 8,
  },
  compassS: {
    bottom: 5,
    alignSelf: 'center',
    left: WHEEL_SIZE / 2 - 4,
  },
  compassW: {
    left: 5,
    top: WHEEL_SIZE / 2 - 8,
  },
});
