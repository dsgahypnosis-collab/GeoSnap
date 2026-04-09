// DeepTimeVisualization.tsx - Cinematic Geological Era Timeline
// Interactive journey through 4.5 billion years of Earth history
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  Extrapolation,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  SlideInLeft,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adventureColors } from '../../utils/adventureTheme';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

interface DeepTimeEvent {
  years_ago: number;
  event: string;
  era?: string;
  description?: string;
}

interface DeepTimeVisualizationProps {
  events?: DeepTimeEvent[];
  specimenAge?: number; // Age in years
  specimenName?: string;
  formationType?: string;
}

// Geological Eras with colors and time ranges
const GEOLOGICAL_ERAS = [
  { 
    name: 'Hadean', 
    start: 4600000000, 
    end: 4000000000, 
    color: '#8B0000',
    icon: 'flame',
    description: 'Earth forms, molten surface'
  },
  { 
    name: 'Archean', 
    start: 4000000000, 
    end: 2500000000, 
    color: '#4B0082',
    icon: 'water',
    description: 'First life, ancient rocks'
  },
  { 
    name: 'Proterozoic', 
    start: 2500000000, 
    end: 541000000, 
    color: '#006400',
    icon: 'leaf',
    description: 'Oxygen rises, complex cells'
  },
  { 
    name: 'Paleozoic', 
    start: 541000000, 
    end: 252000000, 
    color: '#2E8B57',
    icon: 'fish',
    description: 'Cambrian explosion, fish, forests'
  },
  { 
    name: 'Mesozoic', 
    start: 252000000, 
    end: 66000000, 
    color: '#8B4513',
    icon: 'skull',
    description: 'Age of dinosaurs'
  },
  { 
    name: 'Cenozoic', 
    start: 66000000, 
    end: 0, 
    color: '#DAA520',
    icon: 'paw',
    description: 'Mammals rise, humans appear'
  },
];

// Format years for display
const formatYears = (years: number): string => {
  if (years >= 1000000000) {
    return `${(years / 1000000000).toFixed(1)} Billion`;
  } else if (years >= 1000000) {
    return `${(years / 1000000).toFixed(0)} Million`;
  } else if (years >= 1000) {
    return `${(years / 1000).toFixed(0)} Thousand`;
  }
  return `${years}`;
};

// Era marker on timeline
const EraMarker = ({ 
  era, 
  isSelected,
  onPress,
  position,
}: { 
  era: typeof GEOLOGICAL_ERAS[0];
  isSelected: boolean;
  onPress: () => void;
  position: number;
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.2);
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
      glow.value = withTiming(0);
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0.2, 0.8]),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.eraMarker,
          { left: position - 25, backgroundColor: era.color },
          animatedStyle,
          glowStyle,
          isSelected && { borderColor: '#fff', borderWidth: 2 }
        ]}
      >
        <Ionicons name={era.icon as any} size={18} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Event dot on timeline
const TimelineEvent = ({ 
  event, 
  position, 
  index,
  isSpecimenEvent,
}: { 
  event: DeepTimeEvent;
  position: number;
  index: number;
  isSpecimenEvent?: boolean;
}) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isSpecimenEvent) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [isSpecimenEvent]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View 
      style={[styles.eventContainer, { left: position - 40 }]}
      entering={FadeInLeft.delay(index * 100).duration(400)}
    >
      <Animated.View 
        style={[
          styles.eventDot,
          isSpecimenEvent && styles.specimenEventDot,
          isSpecimenEvent && pulseStyle,
        ]}
      />
      <View style={styles.eventLine} />
      <View style={[styles.eventLabel, index % 2 === 0 ? styles.eventLabelTop : styles.eventLabelBottom]}>
        <Text style={styles.eventYears}>{formatYears(event.years_ago)} years ago</Text>
        <Text style={styles.eventText} numberOfLines={2}>{event.event}</Text>
      </View>
    </Animated.View>
  );
};

export const DeepTimeVisualization: React.FC<DeepTimeVisualizationProps> = ({
  events = [],
  specimenAge,
  specimenName,
  formationType,
}) => {
  const [selectedEra, setSelectedEra] = useState<typeof GEOLOGICAL_ERAS[0] | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [timelineWidth] = useState(width * 3); // Scrollable width

  // Default events if none provided
  const defaultEvents: DeepTimeEvent[] = [
    { years_ago: 4540000000, event: 'Earth forms from solar nebula', era: 'Hadean' },
    { years_ago: 4000000000, event: 'First solid rocks form', era: 'Archean' },
    { years_ago: 3500000000, event: 'First life appears', era: 'Archean' },
    { years_ago: 2400000000, event: 'Great Oxidation Event', era: 'Proterozoic' },
    { years_ago: 541000000, event: 'Cambrian Explosion', era: 'Paleozoic' },
    { years_ago: 252000000, event: 'Great Dying extinction', era: 'Paleozoic' },
    { years_ago: 66000000, event: 'Dinosaur extinction', era: 'Mesozoic' },
    { years_ago: 200000, event: 'Humans appear', era: 'Cenozoic' },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  // Add specimen formation event if age provided
  const allEvents = specimenAge ? [
    ...displayEvents,
    { 
      years_ago: specimenAge, 
      event: `${specimenName || 'Your specimen'} forms`,
      era: getEraForAge(specimenAge)?.name,
    }
  ].sort((a, b) => b.years_ago - a.years_ago) : displayEvents;

  function getEraForAge(age: number) {
    return GEOLOGICAL_ERAS.find(era => age >= era.end && age <= era.start);
  }

  // Convert years to position on timeline
  const getPositionForAge = (age: number): number => {
    const maxAge = 4600000000;
    return (1 - age / maxAge) * (timelineWidth - 80) + 40;
  };

  // Scroll to specimen age when loaded
  useEffect(() => {
    if (specimenAge && scrollViewRef.current) {
      const position = getPositionForAge(specimenAge);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: Math.max(0, position - width / 2), animated: true });
      }, 500);
    }
  }, [specimenAge]);

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(600)}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={20} color={adventureColors.amberGlow} />
          <Text style={styles.title}>Deep Time Journey</Text>
        </View>
        <Text style={styles.subtitle}>4.6 Billion Years of Earth History</Text>
      </View>

      {/* Specimen Info */}
      {specimenAge && (
        <Animated.View 
          style={styles.specimenInfo}
          entering={SlideInLeft.duration(500)}
        >
          <LinearGradient
            colors={[adventureColors.amberGlow + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="diamond" size={16} color={adventureColors.amberGlow} />
          <View style={styles.specimenInfoText}>
            <Text style={styles.specimenName}>{specimenName || 'Your Specimen'}</Text>
            <Text style={styles.specimenAgeText}>
              Formed {formatYears(specimenAge)} years ago
              {formationType && ` • ${formationType}`}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.timelineContent, { width: timelineWidth }]}
        decelerationRate="fast"
      >
        {/* Background gradient representing time */}
        <LinearGradient
          colors={GEOLOGICAL_ERAS.map(e => e.color)}
          style={styles.timelineGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />

        {/* Main timeline bar */}
        <View style={styles.timelineLine} />

        {/* Era markers */}
        {GEOLOGICAL_ERAS.map((era, index) => {
          const position = getPositionForAge((era.start + era.end) / 2);
          return (
            <EraMarker
              key={era.name}
              era={era}
              isSelected={selectedEra?.name === era.name}
              onPress={() => setSelectedEra(selectedEra?.name === era.name ? null : era)}
              position={position}
            />
          );
        })}

        {/* Events */}
        {allEvents.map((event, index) => (
          <TimelineEvent
            key={`${event.years_ago}-${index}`}
            event={event}
            position={getPositionForAge(event.years_ago)}
            index={index}
            isSpecimenEvent={event.years_ago === specimenAge}
          />
        ))}

        {/* Time labels */}
        <View style={[styles.timeLabel, { left: 40 }]}>
          <Text style={styles.timeLabelText}>4.6 Billion</Text>
          <Text style={styles.timeLabelSub}>Years Ago</Text>
        </View>
        <View style={[styles.timeLabel, { left: timelineWidth / 2 }]}>
          <Text style={styles.timeLabelText}>2.3 Billion</Text>
          <Text style={styles.timeLabelSub}>Years Ago</Text>
        </View>
        <View style={[styles.timeLabel, { right: 40 }]}>
          <Text style={styles.timeLabelText}>Today</Text>
          <Text style={styles.timeLabelSub}>Present</Text>
        </View>
      </ScrollView>

      {/* Selected Era Info */}
      {selectedEra && (
        <Animated.View 
          style={styles.eraInfo}
          entering={FadeIn.duration(300)}
        >
          <LinearGradient
            colors={[selectedEra.color + '40', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.eraInfoIcon, { backgroundColor: selectedEra.color }]}>
            <Ionicons name={selectedEra.icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.eraInfoContent}>
            <Text style={styles.eraInfoTitle}>{selectedEra.name} Eon</Text>
            <Text style={styles.eraInfoTime}>
              {formatYears(selectedEra.start)} - {formatYears(selectedEra.end)} years ago
            </Text>
            <Text style={styles.eraInfoDesc}>{selectedEra.description}</Text>
          </View>
        </Animated.View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Geological Eras:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {GEOLOGICAL_ERAS.map((era) => (
            <TouchableOpacity
              key={era.name}
              style={[styles.legendItem, selectedEra?.name === era.name && styles.legendItemActive]}
              onPress={() => setSelectedEra(selectedEra?.name === era.name ? null : era)}
            >
              <View style={[styles.legendDot, { backgroundColor: era.color }]} />
              <Text style={styles.legendText}>{era.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 10, 12, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  header: {
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 28,
  },
  specimenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  specimenInfoText: {
    flex: 1,
  },
  specimenName: {
    fontSize: 14,
    fontWeight: '700',
    color: adventureColors.amberGlow,
  },
  specimenAgeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  // Timeline
  timelineContent: {
    height: 200,
    position: 'relative',
    paddingVertical: spacing.xl,
  },
  timelineGradient: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 95,
    height: 10,
    borderRadius: 5,
    opacity: 0.3,
  },
  timelineLine: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 98,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  // Era markers
  eraMarker: {
    position: 'absolute',
    top: 85,
    width: 50,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  // Events
  eventContainer: {
    position: 'absolute',
    top: 60,
    width: 80,
    alignItems: 'center',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: adventureColors.mineralTeal,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 4,
  },
  specimenEventDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: adventureColors.amberGlow,
    borderWidth: 3,
    shadowColor: adventureColors.amberGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  eventLine: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  eventLabel: {
    position: 'absolute',
    width: 100,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
  },
  eventLabelTop: {
    bottom: 75,
  },
  eventLabelBottom: {
    top: 75,
  },
  eventYears: {
    fontSize: 9,
    fontWeight: '700',
    color: adventureColors.amberGlow,
    textAlign: 'center',
  },
  eventText: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  // Time labels
  timeLabel: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeLabelSub: {
    fontSize: 9,
    color: colors.textMuted,
  },
  // Era Info
  eraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    gap: spacing.md,
  },
  eraInfoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraInfoContent: {
    flex: 1,
  },
  eraInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eraInfoTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  eraInfoDesc: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Legend
  legend: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendItemActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

export default DeepTimeVisualization;
